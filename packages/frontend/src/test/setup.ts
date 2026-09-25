import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

type IntersectionCallback = (
  entries: Pick<IntersectionObserverEntry, "isIntersecting">[],
) => void;

class FakeIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin = "";
  thresholds: ReadonlyArray<number> = [];

  private readonly callback: IntersectionCallback;

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
    lastIntersectionObserver = this;
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  triggerIntersection(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }]);
  }
}

let lastIntersectionObserver: FakeIntersectionObserver | undefined;

function triggerIntersection(isIntersecting: boolean): void {
  lastIntersectionObserver?.triggerIntersection(isIntersecting);
}

vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

window.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

export { triggerIntersection };
