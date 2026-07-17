import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue';
import { nextModalHistoryStep } from '../utils/modalHistory.mjs';

const MODAL_STACK_KEY = 'rutinaModalStack';
let modalSequence = 0;
let historyNavigationInFlight = false;
let historyCoordinatorInstalled = false;
const pendingProgrammaticClosures = new Set<string>();

function readModalStack(state: unknown): string[] {
  if (!state || typeof state !== 'object') return [];
  const stack = (state as Record<string, unknown>)[MODAL_STACK_KEY];
  return Array.isArray(stack) ? stack.filter((item): item is string => typeof item === 'string') : [];
}

function reconcileModalHistory() {
  if (typeof window === 'undefined' || historyNavigationInFlight) return;

  const step = nextModalHistoryStep(readModalStack(window.history.state), [...pendingProgrammaticClosures]);
  pendingProgrammaticClosures.clear();
  step.pending.forEach(token => pendingProgrammaticClosures.add(token));

  if (!step.shouldGoBack) return;
  historyNavigationInFlight = true;
  window.history.back();
}

function ensureHistoryCoordinator() {
  if (historyCoordinatorInstalled) return;
  window.addEventListener('popstate', () => {
    historyNavigationInFlight = false;
    queueMicrotask(reconcileModalHistory);
  });
  historyCoordinatorInstalled = true;
}

/**
 * Membuat tombol Back browser/Android menutup modal teratas terlebih dahulu.
 * Penutupan programmatic diserialkan agar cascade child + parent tidak
 * meninggalkan token atau entry history yang stale.
 */
export function useModalBackButton(isOpen: Ref<boolean>) {
  if (import.meta.server) return;
  ensureHistoryCoordinator();

  const modalToken = `rutina-modal-${++modalSequence}`;
  let ownsHistoryEntry = false;
  let closingFromPopState = false;

  const handlePopState = (event: PopStateEvent) => {
    if (isOpen.value) {
      const destinationStack = readModalStack(event.state);
      if (!destinationStack.includes(modalToken)) {
        ownsHistoryEntry = false;
        closingFromPopState = true;
        isOpen.value = false;
        closingFromPopState = false;
      }
    }
  };

  onMounted(() => window.addEventListener('popstate', handlePopState));

  watch(
    isOpen,
    open => {
      if (open && !ownsHistoryEntry) {
        pendingProgrammaticClosures.delete(modalToken);
        const currentState = window.history.state ?? {};
        const stack = readModalStack(currentState);

        window.history.pushState(
          {
            ...currentState,
            [MODAL_STACK_KEY]: [...stack, modalToken],
          },
          '',
        );
        ownsHistoryEntry = true;
        return;
      }

      if (open || !ownsHistoryEntry) return;

      ownsHistoryEntry = false;
      if (closingFromPopState) return;

      pendingProgrammaticClosures.add(modalToken);
      reconcileModalHistory();
    },
    { flush: 'sync' },
  );

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', handlePopState);
    pendingProgrammaticClosures.delete(modalToken);

    if (!ownsHistoryEntry) return;
    const currentState = window.history.state ?? {};
    window.history.replaceState(
      {
        ...currentState,
        [MODAL_STACK_KEY]: readModalStack(currentState).filter(token => token !== modalToken),
      },
      '',
    );
  });
}
