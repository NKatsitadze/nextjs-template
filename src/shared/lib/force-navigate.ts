let navigating = false;

/** Full page navigation (drops client state). Used when the session is gone, e.g. on a 401. */
export function forceNavigate(url: string): void {
  navigating = true;
  window.location.href = url;
}

/** Lets callers skip error UI for requests that failed because a forced navigation is under way. */
export function isForceNavigating(): boolean {
  return navigating;
}
