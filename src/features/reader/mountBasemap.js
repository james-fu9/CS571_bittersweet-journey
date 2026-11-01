// Original geographic drawing routines, scoped to a React-owned host.
import physical from '../atlas/data/atlas-physical.json';
import realGeography from '../atlas/data/real-geography.json';
import rainContour from './data/worldclim-400mm.json';
import greatWall from './data/great-wall.json';

export function mountBasemap(host) {
  const $ = (selector) => host.querySelector(selector);
  const $$ = (selector) => [...host.querySelectorAll(selector)];
  const geography = realGeography.global;
  for (const river of ['yellow','yangtze','pearl']) {
    $$(`[data-river="${river}"]`).forEach(path => path.setAttribute('d', river === 'pearl' ? geography.secondary.pearl : geography.major[river]));
  }
  function mountAtlasBasemap() {
    const atlas = physical;
    const root = $(".atlas-prologue-physical");
    if (!atlas || !root) return;
    const ns = "http://www.w3.org/2000/svg";
    const make = (tag, attrs, parent = root) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([name, value]) => node.setAttribute(name, value));
      parent.append(node);
      return node;
    };
    make("rect", { x: -500, y: -500, width: 2500, height: 2000, class: "prologue-atlas-sea" });
    make("path", { d: atlas.land, class: "prologue-atlas-land", "fill-rule": "evenodd" });
    const regions = make("g", { class: "prologue-atlas-regions", filter: "url(#prologue-wash)" });
    atlas.regions.forEach((feature) => {
      make("path", { d: feature.d, class: `prologue-atlas-region region-${feature.kind} level-${feature.level}` }, regions);
      if (feature.kind === "desert") make("path", { d: feature.d, fill: "url(#prologue-sand)", opacity: ".22" }, regions);
    });
    const relief = make("g", { class: "prologue-atlas-relief" });
    atlas.hachures.forEach((d, index) => make("path", { d, class: `prologue-atlas-hachure weight-${index}` }, relief));
    atlas.contours.forEach((feature) => make("path", { d: feature.d, class: "prologue-atlas-contour" }, relief));
    const water = make("g", { class: "prologue-atlas-water" });
    atlas.rivers.forEach((feature) => make("path", { d: feature.d, class: `prologue-atlas-stream level-${feature.level}` }, water));
    atlas.lakes.forEach((feature) => make("path", { d: feature.d, class: `prologue-atlas-lake level-${feature.level}` }, water));

    const { n, C, coeff } = atlas.projection;
    const radians = Math.PI / 180;
    const project = ([longitude, latitude]) => {
      const rho = Math.sqrt(C - 2 * n * Math.sin(latitude * radians)) / n;
      const theta = n * (longitude - 105) * radians;
      const raw = [rho * Math.sin(theta), -rho * Math.cos(theta), 1];
      return coeff.map((row) => row.reduce((sum, value, index) => sum + value * raw[index], 0));
    };
    const marineLabels = make("g", { class: "prologue-marine-labels" });
    [
      { zh: "渤海", en: "Bohai Sea", at: [119.25, 39.1] },
      { zh: "黄海", en: "Yellow Sea", at: [123.35, 34.45] },
      { zh: "东海", en: "East China Sea", at: [124.7, 28.15] },
      { zh: "南海", en: "South China Sea", at: [116.4, 18.9] },
      { zh: "台湾海峡", en: "Taiwan Strait", at: [119.45, 24.45], detail: true }
    ].forEach(({ zh, en, at, detail }) => {
      const [x, y] = project(at);
      const label = make("text", {
        x: x.toFixed(1), y: y.toFixed(1),
        class: `prologue-marine-label${detail ? " is-detail" : ""}`,
        "text-anchor": "middle", "data-atlas-zh": zh, "data-atlas-en": en
      }, marineLabels);
      label.textContent = en;
    });

    const majorRivers = {
      yellow: geography.major.yellow,
      yangtze: geography.major.yangtze
    };
    Object.entries(majorRivers).forEach(([river, pathData]) => {
      const riverRoot = $(`[data-tour-river="${river}"]`);
      if (!riverRoot) return;
      riverRoot.replaceChildren();
      make("path", { d: pathData, class: "prologue-river-segment" }, riverRoot);
    });
    const yellowLabel = $(".prologue-yellow-label");
    const yangtzeLabel = $(".prologue-yangtze-label");
    if (yellowLabel) { yellowLabel.setAttribute("x", geography.labels.yellow.x); yellowLabel.setAttribute("y", geography.labels.yellow.y); }
    if (yangtzeLabel) { yangtzeLabel.setAttribute("x", geography.labels.yangtze.x); yangtzeLabel.setAttribute("y", geography.labels.yangtze.y); }
  }
  mountAtlasBasemap();

  function mountReaderBasemap() {
    const atlas = physical;
    const root = $("[data-reader-physical]");
    if (!atlas || !root) return;
    const ns = "http://www.w3.org/2000/svg";
    const make = (tag, attrs, parent = root) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs || {}).forEach(([name, value]) => node.setAttribute(name, value));
      parent.append(node);
      return node;
    };
    root.replaceChildren();
    const { n, C, coeff } = atlas.projection;
    const radians = Math.PI / 180;
    const project = ([longitude, latitude]) => {
      const rho = Math.sqrt(C - 2 * n * Math.sin(latitude * radians)) / n;
      const theta = n * (longitude - 105) * radians;
      const raw = [rho * Math.sin(theta), -rho * Math.cos(theta), 1];
      return coeff.map((row) => row.reduce((sum, value, index) => sum + value * raw[index], 0));
    };
    const climateContour = rainContour;
    if (climateContour?.coordinates?.length) {
      const projected = climateContour.coordinates.map(project);
      const contourPath = projected.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
      $$(`[data-rain-contour]`).forEach((path) => path.setAttribute("d", contourPath));
      const label = $(`[data-rain-label]`);
      if (label) {
        const anchor = projected[projected.length - 1];
        label.setAttribute("x", (anchor[0] + 12).toFixed(1));
        label.setAttribute("y", (anchor[1] - 10).toFixed(1));
      }
    }
    const wall = greatWall?.features?.[0]?.geometry?.coordinates || [];
    const wallPath = wall.map((line) => line.map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join("")).join("");
    const wallElement = $(`[data-great-wall]`);
    if (wallElement) wallElement.setAttribute("d", wallPath);

    const places = {
      yinxu: [114.31861, 36.1225],
      sanxingdui: [104.19944, 30.99389],
      liangzhu: [119.99083, 30.39555],
      threeGorges: [111.02, 30.82]
    };
    Object.entries(places).forEach(([name, coordinate]) => {
      const marker = $(`[data-place="${name}"]`);
      if (!marker) return;
      const [x, y] = project(coordinate);
      marker.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
    });
    make("rect", { x: -500, y: -500, width: 2500, height: 2000, class: "reader-atlas-sea" });
    make("path", { d: atlas.land, class: "reader-atlas-land", "fill-rule": "evenodd" });
    const regions = make("g", { class: "reader-atlas-regions", filter: "url(#reader-region-wash)" });
    atlas.regions.forEach((feature) => {
      make("path", { d: feature.d, class: `reader-atlas-region region-${feature.kind} level-${feature.level}` }, regions);
      if (feature.kind === "desert") make("path", { d: feature.d, fill: "url(#reader-sand)", opacity: ".22" }, regions);
    });
    const relief = make("g", { class: "reader-atlas-relief" });
    atlas.hachures.forEach((d, index) => make("path", { d, class: `reader-atlas-hachure weight-${index}` }, relief));
    atlas.contours.forEach((feature) => make("path", { d: feature.d, class: "reader-atlas-contour" }, relief));
    const water = make("g", { class: "reader-atlas-water" });
    // level (Natural Earth scalerank band) lets phones keep only the large rivers, lakes and ranges (styles.css)
    atlas.rivers.forEach((feature) => make("path", { d: feature.d, class: `reader-atlas-stream level-${feature.level}` }, water));
    atlas.lakes.forEach((feature) => make("path", { d: feature.d, class: `reader-atlas-lake level-${feature.level}` }, water));
  }
  mountReaderBasemap();


}
