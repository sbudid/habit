export function nextModalHistoryStep(stack, pending) {
  const uniqueStack = [...new Set(stack.filter(token => typeof token === 'string'))];
  const activePending = [...new Set(pending.filter(token => uniqueStack.includes(token)))];
  const topToken = uniqueStack.at(-1);

  if (!topToken || !activePending.includes(topToken)) {
    return { shouldGoBack: false, pending: activePending };
  }

  return {
    shouldGoBack: true,
    pending: activePending.filter(token => token !== topToken),
  };
}
