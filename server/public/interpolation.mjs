// Render between authoritative snapshots without changing the simulation.
export function positionAt(sample, target, now) {
  if (!sample) return {x: target.x, y: target.y};
  const progress = Math.max(0, Math.min(1, (now - sample.time) / sample.duration));
  return {x: sample.x + (target.x - sample.x) * progress,
          y: sample.y + (target.y - sample.y) * progress};
}

export function nextSamples(previous, current, samples, now) {
  const result = new Map();
  for (const [kind, entities] of [['p', current.players || []], ['e', current.enemies || []]]) {
    const oldEntities = new Map((kind === 'p' ? previous?.players : previous?.enemies)?.map(entity => [entity.id, entity]) || []);
    for (const entity of entities) {
      if (entity.hidden || !Number.isFinite(entity.x) || !Number.isFinite(entity.y)) continue;
      const key = `${kind}:${entity.id}`;
      const old = oldEntities.get(entity.id);
      const sample = samples.get(key);
      const usable = old && !old.hidden && Number.isFinite(old.x) && Number.isFinite(old.y) && sample;
      // Start at the position currently on screen, even when updates arrive irregularly.
      const start = usable ? positionAt(sample, old, now) : entity;
      const duration = usable ? Math.max(60, Math.min(160, now - sample.time)) : 100;
      result.set(key, {x: start.x, y: start.y, time: now, duration});
    }
  }
  return result;
}
