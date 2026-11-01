// Every effect owns its listeners, observers and scheduled frames. StrictMode can
// mount -> dispose -> mount without leaving a second camera or animation loop.
export function createLifecycle() {
  const cleanups = [];
  const frames = new Set();
  let disposed = false;
  return {
    listen(target, type, callback, options) {
      target.addEventListener(type, callback, options);
      cleanups.push(() => target.removeEventListener(type, callback, options));
    },
    resize(target, callback) {
      const observer = new ResizeObserver(() => { if (!disposed) callback(); });
      observer.observe(target);
      cleanups.push(() => observer.disconnect());
    },
    frame(callback) {
      if (disposed) return 0;
      const id = requestAnimationFrame(time => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelFrame(id) { cancelAnimationFrame(id); frames.delete(id); },
    cleanup(callback) { cleanups.push(callback); },
    destroy() {
      if (disposed) return;
      disposed = true;
      frames.forEach(cancelAnimationFrame);
      frames.clear();
      cleanups.reverse().forEach(callback => callback());
    },
  };
}
