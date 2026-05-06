import "@testing-library/jest-dom/vitest";

/** jsdom lacks these; UI code and framer-motion viewport features expect them. */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(
    readonly callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit,
  ) {
    queueMicrotask(() => {
      this.callback(
        [{ isIntersecting: true, target: document.body } as IntersectionObserverEntry],
        this,
      );
    });
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
globalThis.IntersectionObserver =
  IntersectionObserverStub as unknown as typeof IntersectionObserver;

class ResizeObserverStub implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

const noop = () => {};
/** Minimal 2D canvas stub for hero / dot canvases */
HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
  _attrs?: CanvasRenderingContext2DSettings | WebGLContextAttributes,
): RenderingContext | null {
  if (contextId === "2d") {
    return {
      canvas: this,
      fillStyle: "",
      strokeStyle: "",
      globalAlpha: 1,
      lineWidth: 1,
      fillRect: noop,
      clearRect: noop,
      beginPath: noop,
      closePath: noop,
      arc: noop,
      moveTo: noop,
      lineTo: noop,
      stroke: noop,
      fill: noop,
      setTransform: noop,
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
};
