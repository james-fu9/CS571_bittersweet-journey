// Original chapter-label collision and leader-line algorithm, scoped to the React atlas.
export function mountLabels(root, state, seals, camera, lifecycle) {
  const body = root;
  const mapSvg = root.querySelector('.china-map');
  const svgNS = 'http://www.w3.org/2000/svg';
  const HOME_TYPE = { clue: [22, 16], number: [16, 14], context: [16, 14], seal: [36, 30] };
  const shownElement = (node) => Boolean(node) && window.getComputedStyle(node).display !== "none";
  const boxOverlap = (a, b) =>
    Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const distanceToBox = (x, y, b) => Math.hypot(Math.max(b.left - x, 0, x - b.right), Math.max(b.top - y, 0, y - b.bottom));
  const translation = (node) => {
    const match = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(node.getAttribute("transform") || "");
    return match ? [Number(match[1]), Number(match[2])] : [0, 0];
  };

  function layoutAtlas() {
    const ctm = mapSvg.getScreenCTM();
    const frame = mapSvg.getBoundingClientRect();
    if (!ctm || !frame.width) return;
    const scale = Math.hypot(ctm.a, ctm.b);
    const phone = window.innerWidth <= 900 ? 1 : 0; // the whole map fits a narrow screen, so its labels are smaller
    const unit = (px) => Math.max(px, 13.5) / scale; // screen px to map units, never under 10pt
    const size = { clue: unit(HOME_TYPE.clue[phone]), number: unit(HOME_TYPE.number[phone]), context: unit(HOME_TYPE.context[phone]) };
    const toMap = (x, y) => ({ x: (x - ctm.e) / ctm.a, y: (y - ctm.f) / ctm.d });

    // the part of the map a reader can see (the whole map when it scrolls sideways on a phone)
    const stage = root.querySelector(".atlas-map-stage");
    const stageBox = stage.getBoundingClientRect();
    const scrolls = stage.scrollWidth > stage.clientWidth + 1;
    const topLeft = toMap(scrolls ? frame.left : Math.max(frame.left, stageBox.left), Math.max(frame.top, stageBox.top));
    const bottomRight = toMap(scrolls ? frame.right : Math.min(frame.right, stageBox.right), Math.min(frame.bottom, stageBox.bottom));
    const margin = 6 / scale;
    const area = { left: topLeft.x + margin, right: bottomRight.x - margin, top: topLeft.y + margin, bottom: bottomRight.y - margin };

    // H0: the heading and call-out float over the map on wide screens (L-7)
    const taken = [];
    [".atlas-intro h1", ".atlas-guide-toggle", ".atlas-eyebrow", ".cta-callout", ".cta-reopen", ".atlas-navigation", ".atlas-geography-notes", ".atlas-chapter-index", ".atlas-location-panel"].forEach((selector) => {
      const node = root.querySelector(selector);
      if (!shownElement(node)) return;
      const b = node.getBoundingClientRect();
      if (!b.width) return;
      const a = toMap(b.left - 4, b.top - 4), c = toMap(b.right + 4, b.bottom + 4);
      taken.push({ left: a.x, right: c.x, top: a.y, bottom: c.y });
    });

    // every dot takes its place before any label (L-10)
    const points = [...root.querySelectorAll(".story-point")].map((group) => {
      const [tx, ty] = translation(group);
      const core = group.querySelector(".point-core").getBBox();
      const extra = group.querySelector(".point-archive-mark");
      let r = Math.max(core.width, core.height) / 2;
      if (shownElement(extra)) {
        // the symbol includes its mark (道士塔's cave door): labels sit clear of the whole symbol
        const rect = extra.getBoundingClientRect(), a = toMap(rect.left,rect.top), b = toMap(rect.right,rect.bottom);
        const ccx = core.x + core.width / 2 + tx, ccy = core.y + core.height / 2 + ty;
        r = Math.max(r, ccx-a.x, b.x-ccx, ccy-a.y, b.y-ccy);
      }
      return {
        group, name: group.dataset.story, tx, ty, r,
        cx: core.x + core.width / 2 + tx, cy: core.y + core.height / 2 + ty,
        clues: [...group.querySelectorAll(".point-clue")],
        number: group.querySelector(".point-number"),
        mark: group.querySelector(".point-archive-mark")
      };
    });
    points.forEach((p) => {
      const pad = 2 / scale;
      taken.push({ left: p.cx - p.r - pad, right: p.cx + p.r + pad, top: p.cy - p.r - pad, bottom: p.cy + p.r + pad });
      if (shownElement(p.mark)) {
        const b = p.mark.getBoundingClientRect(), a = toMap(b.left,b.top), c = toMap(b.right,b.bottom);
        taken.push({ left:a.x, right:c.x, top:a.y, bottom:c.y });
      }
    });

    // L-3: a spot is not clear when it is nearer another dot than its own, or nearer a labelled dot than that dot's label
    const ownershipPenalty = (p, box, gap) => {
      const own = distanceToBox(p.cx, p.cy, box);
      return points.reduce((sum, q) => {
        if (q === p || Math.hypot(q.cx-p.cx,q.cy-p.cy)*scale < 32) return sum;
        const d = distanceToBox(q.cx, q.cy, box);
        if (d < own + gap) sum += 500;
        if (q.labelBox && d < distanceToBox(q.cx, q.cy, q.labelBox)) sum += 500;
        return sum;
      }, 0);
    };
    const cost = (box) => {
      const outside = Math.max(0, area.left - box.left) + Math.max(0, box.right - area.right) +
        Math.max(0, area.top - box.top) + Math.max(0, box.bottom - area.bottom);
      return outside * 1000 + taken.reduce((sum, other) => sum + boxOverlap(box, other), 0);
    };

    // The chapter labels (H1 on this map: they are the page's controls). Each tries #1-#5 (L-4); the positions are
    // searched together, most crowded dots first (H-2), so one long label cannot shut a neighbour out. If no
    // arrangement is fully clear, each label falls back to its least-crowded spot.
    // crowding is judged on screen: dots that zoom apart stop being a cluster
    const crowding = (p) => points.filter((q) => q !== p && Math.hypot(q.cx - p.cx, q.cy - p.cy) * scale < 90).length;
    points.forEach(p => {
      p.inView = p.cx > area.left && p.cx < area.right && p.cy > area.top && p.cy < area.bottom;
      [...p.clues,p.number, ...p.group.querySelectorAll('.chapter-label-leader')].forEach(node => { node.style.visibility = p.inView ? '' : 'hidden'; });
    });
    const labelled = [...points].sort((a, b) => crowding(b) - crowding(a)).filter((p) => p.inView && p.clues.some(shownElement));
    labelled.forEach((p) => {
      const clue = p.clues.find(shownElement);
      // font and halo are both set in map units, so both are rescaled at every zoom (the halo grew with the map before)
      p.clues.forEach((node) => { node.style.fontSize = `${size.clue.toFixed(2)}px`; node.style.strokeWidth = `${(3 / scale).toFixed(3)}px`; });
      p.number.style.fontSize = `${size.number.toFixed(2)}px`;
      p.number.style.strokeWidth = `${(2.5 / scale).toFixed(3)}px`;
      const availableWidth = area.right - area.left;
      const textWidth = clue.getComputedTextLength();
      if (textWidth > availableWidth) p.clues.forEach(node => { node.style.fontSize = (size.clue * availableWidth / textWidth) + 'px'; });
      const w = Math.max(clue.getComputedTextLength(), p.number.getComputedTextLength());
      // line heights from the fonts themselves (the English face has taller line boxes)
      const metrics = (node) => { node.setAttribute("y", "0"); const b = node.getBBox(); return { ascent: -b.y, height: b.height }; };
      const numberLine = metrics(p.number), clueLine = metrics(clue);
      const h = numberLine.height + clueLine.height;
      const gap = crowding(p) ? 28 / scale : size.clue * 0.25, lift = size.clue * 0.1;
      const { cx, cy, r } = p;
      // [text-anchor, block left, block top]: #1 右上, #2 右下, #2 左上, #3 左下, #4 正上, #5 正下
      p.candidates = [
        ["start", cx + r + gap, cy - lift - h], ["start", cx + r + gap, cy + lift],
        ["end", cx - r - gap - w, cy - lift - h], ["end", cx - r - gap - w, cy + lift],
        ["middle", cx - w / 2, cy - r - gap - h], ["middle", cx - w / 2, cy + r + gap]
      ];
      // Dense geographic clusters keep their dots in place; only their labels fan out, stacked in rows on the
      // side the dot lies on within its cluster (a western dot is labelled to the left, an eastern one to the
      // right), so a leader never has to cross the cluster. Nearer rows are tried first.
      p.side = null;
      if (crowding(p)) {
        const cluster = points.filter((q) => Math.hypot(q.cx - cx, q.cy - cy) * scale < 90);
        const offset = (cx - cluster.reduce((sum, q) => sum + q.cx, 0) / cluster.length) * scale;
        p.side = offset < -3 ? "left" : offset > 3 ? "right" : null;
        const step = h + 18 / scale; // clear of the 16px label spacing
        for (let row = -4; row <= 4; row += 1) {
          const y = cy - h / 2 + row * step;
          p.candidates.push(["start", cx + r + gap, y], ["end", cx - r - gap - w, y]);
        }
      }
      p.candidates = p.candidates.map(([anchor, x, y], index) => {
        x = Math.max(area.left, Math.min(area.right - w, x));
        const box = { left: x, right: x + w, top: y, bottom: y + h };
        const wrongSide = (p.side === "left" && anchor !== "end") || (p.side === "right" && anchor !== "start");
        // rank: the #1-#5 order for a dot on its own; side first, then nearness, in a cluster
        const rank = p.side || crowding(p)
          ? (wrongSide ? 1000 : 0) + (anchor === "middle" ? 40 : 0) + distanceToBox(cx, cy, box) * scale
          : index;
        return { anchor, x, y, w, box, rank, fixed: cost(box) };
      })
        // a label is never sent far from its dot: past this it yields instead (H2), its dot and pop-up remain
        .filter((candidate) => distanceToBox(cx, cy, candidate.box) * scale <= 120)
        .sort((a, b) => a.rank - b.rank);
      p.gap = gap;
      p.lines = { number: numberLine, clue: clueLine };
    });
    const labelSpacing = 16 / scale;
    const paddedLabel = box => ({left:box.left-labelSpacing, right:box.right+labelSpacing, top:box.top-labelSpacing, bottom:box.bottom+labelSpacing});
    // A leader runs from the dot to the nearest point of its label box. Leaders must not cross each other,
    // nor pass through another chapter's label, or the reader can no longer tell which label is whose (L-3).
    const leaderOf = (p, box) => {
      if (distanceToBox(p.cx, p.cy, box) * scale <= 20) return null;
      return [p.cx, p.cy, Math.max(box.left, Math.min(box.right, p.cx)), Math.max(box.top, Math.min(box.bottom, p.cy))];
    };
    const cross = (a, b) => {
      const d = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      const p1 = [a[0], a[1]], p2 = [a[2], a[3]], q1 = [b[0], b[1]], q2 = [b[2], b[3]];
      return d(p1, p2, q1) * d(p1, p2, q2) < 0 && d(q1, q2, p1) * d(q1, q2, p2) < 0;
    };
    const throughBox = (line, box) => {
      // sample the segment: a leader that enters another label's box passes through it
      for (let i = 1; i < 12; i++) {
        const x = line[0] + (line[2] - line[0]) * i / 12, y = line[1] + (line[3] - line[1]) * i / 12;
        if (x > box.left && x < box.right && y > box.top && y < box.bottom) return true;
      }
      return false;
    };
    const clash = (p, candidate) => {
      let sum = labelled.reduce((total, q) => (q.labelBox ? total + boxOverlap(candidate.box, paddedLabel(q.labelBox)) : total), 0) +
        // a clustered label is tied to its dot by its leader, so only a dot right beside the label confuses it
        ownershipPenalty(p, candidate.box, p.side || crowding(p) ? 6 / scale : p.gap);
      const line = leaderOf(p, candidate.box);
      // nor through another chapter's dot (dots that sit on top of each other excepted)
      if (line) points.forEach((q) => {
        if (q === p || Math.hypot(q.cx - p.cx, q.cy - p.cy) <= p.r + q.r + 2 / scale) return;
        const dx = line[2] - line[0], dy = line[3] - line[1];
        const t = Math.max(0, Math.min(1, ((q.cx - line[0]) * dx + (q.cy - line[1]) * dy) / (dx * dx + dy * dy || 1)));
        if (Math.hypot(line[0] + dx * t - q.cx, line[1] + dy * t - q.cy) < q.r + 3 / scale) sum += 1e7;
      });
      labelled.forEach((q) => {
        if (q === p || !q.labelBox) return;
        const other = leaderOf(q, q.labelBox);
        // crossing leaders outweigh any amount of overlap: the fallback never accepts one to save space
        if (line && other && cross(line, other)) sum += 1e7;
        if (line && throughBox(line, q.labelBox)) sum += 1e7;
        if (other && throughBox(other, candidate.box)) sum += 1e7;
      });
      return sum;
    };
    // Branch and bound: of the fully clear arrangements, keep the one whose labels sit nearest their dots
    // (lowest total rank), not merely the first found, so one label is not sent far away to make room.
    let budget = 40000;
    let best = null;
    // lower bound for pruning: the best rank each remaining label could still get
    const floor = labelled.map((p) => Math.min(Infinity, ...p.candidates.filter((c) => c.fixed === 0).map((c) => c.rank)));
    const rest = floor.map((_, i) => floor.slice(i).reduce((sum, value) => sum + value, 0));
    const search = (index, total) => {
      if (best && total + (rest[index] || 0) >= best.total) return;
      if (index === labelled.length) {
        best = { total, picks: labelled.map((p) => p.chosen) };
        return;
      }
      const p = labelled[index];
      for (const candidate of p.candidates) {
        if (--budget < 0) return;
        if (candidate.fixed > 0 || clash(p, candidate) > 0) continue;
        p.labelBox = candidate.box;
        p.chosen = candidate;
        search(index + 1, total + candidate.rank);
        p.labelBox = null;
        p.chosen = null;
      }
    };
    labelled.forEach((p) => { p.labelBox = null; p.chosen = null; });
    search(0, 0);
    const clear = Boolean(best);
    if (best) labelled.forEach((p, i) => { p.chosen = best.picks[i]; p.labelBox = p.chosen.box; });
    // recorded for the map checks (docs/map-guidance.md §10): "clear", or the dots with no clear spot of their own
    mapSvg.dataset.labelLayout = clear ? "clear" : "fallback: " + labelled.filter((p) => p.candidates.every((c) => c.fixed > 0)).map((p) => p.name).join(" ");
    if (!clear) {
      labelled.forEach((p) => { p.labelBox = null; p.chosen = null; });
      // Even a crowded overview must leave every chapter dot tappable.
      const pick = (p) => {
        const safe = p.candidates.filter(c => points.every(q => distanceToBox(q.cx,q.cy,c.box) > q.r + 2 / scale));
        p.chosen = safe.reduce((best, c) => {
          const total = c.fixed + clash(p, c) + c.rank * 0.05;
          return !best || total < best.total ? { ...c, total } : best;
        }, null);
        p.labelBox = p.chosen?.box || null;
      };
      labelled.forEach(pick);
      // Repair passes: each label is chosen again against all the others, so a label placed early is not
      // left crossing a leader that was drawn after it. Stops once a pass changes nothing.
      for (let round = 0; round < 4; round += 1) {
        let changed = false;
        labelled.forEach((p) => {
          const before = p.chosen;
          p.labelBox = null;
          pick(p);
          if (p.chosen?.box !== before?.box && (p.chosen?.x !== before?.x || p.chosen?.y !== before?.y)) changed = true;
        });
        if (!changed) break;
      }
    }
    // H2: a label that still overlaps one already kept gives way (its dot stays, and its pop-up still names it).
    // Labels are kept in reading order of priority: the chapter being read back, then unread chapters, then read ones.
    const kept = [];
    const priority = (p) => (p.name === body.dataset.returningStory ? 0 : state.complete[p.name] ? 2 : 1);
    [...labelled].sort((a, b) => priority(a) - priority(b)).forEach((p) => {
      if (!p.chosen) return;
      // Never put a fallback label beneath a React overlay or outside the visible map.
      // Its geographic point and the accessible location index remain available.
      if (p.chosen.fixed > 0) { p.chosen = null; p.labelBox = null; return; }
      if (kept.some((box) => boxOverlap(p.chosen.box, box) > 0)) { p.chosen = null; p.labelBox = null; return; }
      kept.push(p.chosen.box);
    });
    labelled.forEach((p) => {
      const best = p.chosen;
      let leader = p.group.querySelector('.chapter-label-leader');
      if (!leader) {
        leader = document.createElementNS(svgNS, 'path');
        leader.setAttribute('class', 'chapter-label-leader');
        leader.setAttribute('aria-hidden', 'true');
        p.group.prepend(leader);
      }
      leader.removeAttribute('d');
      if (best && distanceToBox(p.cx, p.cy, best.box) * scale > 20) {
        const x = Math.max(best.box.left, Math.min(best.box.right, p.cx));
        const y = Math.max(best.box.top, Math.min(best.box.bottom, p.cy));
        leader.setAttribute('d', 'M'+(p.cx-p.tx)+','+(p.cy-p.ty)+' L'+(x-p.tx)+','+(y-p.ty));
      }
      if (!best) {
        [...p.clues,p.number].forEach(node => { node.style.visibility = 'hidden'; });
        return;
      }
      const textX = best.anchor === "start" ? best.x : best.anchor === "end" ? best.x + best.w : best.x + best.w / 2;
      const put = (node, baseline) => {
        node.removeAttribute("transform");
        node.setAttribute("text-anchor", best.anchor);
        node.setAttribute("x", (textX - p.tx).toFixed(1));
        node.setAttribute("y", (baseline - p.ty).toFixed(1));
      };
      p.clues.forEach((node) => put(node, best.y + p.lines.number.height + p.lines.clue.ascent));
      put(p.number, best.y + p.lines.number.ascent);
      taken.push(best.box);
    });

    // M-7: each read chapter's seal next to its dot: #3 左下, #5 正下, #2 右下, #2 左上, #4 正上, #1 右上
    const sealSize = HOME_TYPE.seal[phone] / scale;
    points.forEach((p) => {
      const seal = seals[p.name];
      if (!seal) return;
      if (!state.complete[p.name] || !p.inView) { seal.classList.remove("is-shown"); return; }
      const gap = 4 / scale, { cx, cy, r } = p;
      const spots = [
        [cx - r - gap - sealSize, cy + gap], [cx - sealSize / 2, cy + r + gap], [cx + r + gap, cy + gap],
        [cx - r - gap - sealSize, cy - gap - sealSize], [cx - sealSize / 2, cy - r - gap - sealSize], [cx + r + gap, cy - gap - sealSize]
      ];
      const found = spots.map(([x, y]) => ({ x, y, box: { left: x, right: x + sealSize, top: y, bottom: y + sealSize } }))
        .find((spot) => cost(spot.box) === 0);
      seal.classList.toggle("is-shown", Boolean(found));
      if (!found) return;
      ["x", "y"].forEach((key) => seal.setAttribute(key, found[key].toFixed(1)));
      seal.setAttribute("width", sealSize.toFixed(1));
      seal.setAttribute("height", sealSize.toFixed(1));
      taken.push(found.box);
    });

    // H5: river and road names along their lines; a name with no clear spot is left out (L-8)
    const routeLabels = [...root.querySelectorAll(".ancient-routes .route-label")];
    [
      { path: root.querySelector("#global-yellow"), labels: [...root.querySelectorAll(".yellow-river .map-text")] },
      { path: root.querySelector("#global-yangtze"), labels: [...root.querySelectorAll(".yangtze-river .map-text")] },
      { path: root.querySelector(".silk-road"), labels: routeLabels.slice(0, 2) },
      { path: root.querySelector(".tea-road"), labels: routeLabels.slice(2, 4) }
    ].forEach(({ path, labels }) => {
      const label = labels.find(shownElement);
      labels.forEach((node) => { node.style.fontSize = `${size.context.toFixed(2)}px`; node.style.strokeWidth = `${(3 / scale).toFixed(3)}px`; node.setAttribute("text-anchor", "middle"); });
      if (!label || !path || !path.getTotalLength) return;
      const length = path.getTotalLength();
      const width = label.getComputedTextLength();
      const placed = [0.5, 0.6, 0.4, 0.7, 0.3, 0.8, 0.2, 0.9, 0.1].some((t) => {
        const point = path.getPointAtLength(length * t);
        const baseline = point.y - size.context * 0.4;
        const box = { left: point.x - width / 2, right: point.x + width / 2, top: baseline - size.context * 0.9, bottom: baseline + size.context * 0.25 };
        const nearDot = points.some((q) => distanceToBox(q.cx, q.cy, box) < Math.max(size.context, q.labelBox ? distanceToBox(q.cx, q.cy, q.labelBox) : 0));
        if (cost(box) > 0 || nearDot) return false;
        labels.forEach((node) => { node.setAttribute("x", point.x.toFixed(1)); node.setAttribute("y", baseline.toFixed(1)); });
        taken.push(box);
        return true;
      });
      labels.forEach((node) => { node.style.visibility = placed ? "" : "hidden"; });
    });
    camera.layoutLabels(taken, area, scale);
  }
  let layoutQueued = false;
  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    lifecycle.frame(() => { layoutQueued = false; layoutAtlas(); });
  }
  return scheduleLayout;
}
