// Must be imported before `prismjs`. Prism auto-runs highlightAll() on DOMContentLoaded in
// the browser unless `Prism.manual` is set first; we highlight at render time instead, so the
// automatic pass would only rewrite DOM that React owns.
type PrismGlobal = { Prism?: { manual?: boolean } };

if (typeof window !== 'undefined') {
  const w = window as unknown as PrismGlobal;
  w.Prism = { ...w.Prism, manual: true };
}

export {};
