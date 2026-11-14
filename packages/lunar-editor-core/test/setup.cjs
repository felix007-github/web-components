// Geometry is a browser integration concern; these DOM tests exercise editor
// state, source synchronization and lifecycle without a layout engine.
const rectangle = () => ({
  x: 0,
  y: 0,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  width: 0,
  height: 0,
  toJSON() {
    return {};
  },
});
Range.prototype.getBoundingClientRect = rectangle;
Range.prototype.getClientRects = () =>
  Object.assign([], {
    item() {
      return null;
    },
  });
HTMLElement.prototype.scrollIntoView = function () {};
window.requestAnimationFrame ??= (callback) =>
  window.setTimeout(() => callback(performance.now()), 0);
window.cancelAnimationFrame ??= (id) => window.clearTimeout(id);
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
