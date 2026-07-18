function uniqueIds(ids) {
  return new Set(ids);
}

export function buildReorderPlan(ownedIds, orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.some(id => !Number.isInteger(id))) {
    throw new Error('Urutan habit tidak valid.');
  }
  if (uniqueIds(orderedIds).size !== orderedIds.length) {
    throw new Error('Urutan habit mengandung ID duplikat.');
  }
  if (ownedIds.length !== orderedIds.length) {
    throw new Error('Urutan harus memuat seluruh habit user.');
  }

  const owned = uniqueIds(ownedIds);
  if (orderedIds.some(id => !owned.has(id))) {
    throw new Error('Urutan mengandung habit yang bukan milik user.');
  }

  return orderedIds.map((id, sortOrder) => ({ id, sortOrder }));
}

export function moveHabitIds(ids, id, direction) {
  const currentIndex = ids.indexOf(id);
  if (currentIndex === -1) return [...ids];
  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= ids.length) return [...ids];
  const next = [...ids];
  [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
  return next;
}

export function reorderHabitIds(ids, sourceId, targetId) {
  const sourceIndex = ids.indexOf(sourceId);
  const targetIndex = ids.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return [...ids];

  const next = [...ids];
  next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, sourceId);
  return next;
}

export function canReorderHabit(groups, sourceId, targetId) {
  return groups.has(sourceId) && groups.has(targetId) && groups.get(sourceId) === groups.get(targetId);
}
