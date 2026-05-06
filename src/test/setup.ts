import "@testing-library/jest-dom/vitest";

function mockIntersectionEntry(target: Element): IntersectionObserverEntry {
  const empty = (): DOMRectReadOnly =>
    ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON() {
        return {};
      },
    }) as DOMRectReadOnly;

  return {
    isIntersecting: true,
    boundingClientRect: empty(),
    intersectionRatio: 1,
    intersectionRect: empty(),
    rootBounds: null,
    target,
    time: 0,
  };
}

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
        [mockIntersectionEntry(document.body)],
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

/** Minimal 2D canvas stub for hero / dot canvases (`getContext` is overloaded on the prototype). */
const stubCanvasGetContext: typeof HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  contextId: string,
  _attrs?,
) {
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
} as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = stubCanvasGetContext;
