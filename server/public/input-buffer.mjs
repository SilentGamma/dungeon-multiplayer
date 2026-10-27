// Send immediately instead of queuing actions behind slow requests. Sequence
// numbers on the server make older requests harmless if they arrive late.
export function createInputBuffer(send, {maxInFlight = 4, timeoutMs = 1200} = {}) {
  const active = new Set();
  let closed = false;
  function push(message) {
    if (closed) return;
    while (active.size >= maxInFlight) active.values().next().value.abort();
    const controller = new AbortController();
    active.add(controller);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Abort immediately removes the request from the bounded local buffer.
    controller.signal.addEventListener('abort', () => { clearTimeout(timer); active.delete(controller); }, {once: true});
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) return send(message, controller.signal);
    }).catch(() => {}).finally(() => {
      clearTimeout(timer);
      active.delete(controller);
    });
  }
  function close() {
    closed = true;
    for (const controller of active) controller.abort();
    active.clear();
  }
  return {push, close};
}
