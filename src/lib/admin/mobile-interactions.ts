export type ResultPanelState = { selectedId: string | null; published: boolean };
export type ResultPanelEvent =
  | { type: "select"; fixtureId: string; published: boolean }
  | { type: "close" | "escape" | "back" };

export function transitionResultPanel(state: ResultPanelState, event: ResultPanelEvent): ResultPanelState {
  if (event.type === "select") return { selectedId: event.fixtureId, published: event.published };
  return { selectedId: null, published: false };
}

export function usesDesktopResultPanel(width: number) {
  return width > 620;
}

export function shouldCloseResultPanel(key: string) {
  return key === "Escape";
}

export function toggleAdminMenu(open: boolean, event: "toggle" | "navigate" | "escape") {
  if (event === "navigate" || event === "escape") return false;
  return !open;
}
