export type AssistantDockEdge = "left" | "right" | "top" | "bottom";
export type AssistantDock = { edge: AssistantDockEdge; ratio: number };
export type AssistantViewport = { left: number; top: number; width: number; height: number };

export const ASSISTANT_LAUNCHER_SIZE = 48;
export const ASSISTANT_DOCK_STORAGE_KEY = "silid-assistant-dock-v1";
export const ASSISTANT_HINT_STORAGE_KEY = "silid-assistant-move-hint-dismissed-v1";
export const ASSISTANT_DEFAULT_DOCK: AssistantDock = { edge: "right", ratio: 0.65 };

const edges: AssistantDockEdge[] = ["left", "right", "top", "bottom"];
const clamp = (value: number, maximum: number) =>
  Math.max(0, Math.min(value, Math.max(0, maximum)));

export function readAssistantDock(value: unknown): AssistantDock | null {
  if (!value || typeof value !== "object") return null;
  const dock = value as AssistantDock;
  return edges.includes(dock.edge) &&
    Number.isFinite(dock.ratio) &&
    dock.ratio >= 0 &&
    dock.ratio <= 1
    ? { edge: dock.edge, ratio: dock.ratio }
    : null;
}

export function clampAssistantPoint(point: { x: number; y: number }, viewport: AssistantViewport) {
  return {
    x: clamp(point.x, viewport.width - ASSISTANT_LAUNCHER_SIZE),
    y: clamp(point.y, viewport.height - ASSISTANT_LAUNCHER_SIZE),
  };
}

export function assistantDockPoint(dock: AssistantDock, viewport: AssistantViewport) {
  const width = Math.max(0, viewport.width - ASSISTANT_LAUNCHER_SIZE);
  const height = Math.max(0, viewport.height - ASSISTANT_LAUNCHER_SIZE);
  return {
    x: dock.edge === "left" ? 0 : dock.edge === "right" ? width : width * dock.ratio,
    y: dock.edge === "top" ? 0 : dock.edge === "bottom" ? height : height * dock.ratio,
  };
}

export function nearestAssistantDock(
  point: { x: number; y: number },
  viewport: AssistantViewport,
): AssistantDock {
  const { x, y } = clampAssistantPoint(point, viewport);
  const width = Math.max(0, viewport.width - ASSISTANT_LAUNCHER_SIZE);
  const height = Math.max(0, viewport.height - ASSISTANT_LAUNCHER_SIZE);
  const distances = [x, width - x, y, height - y];
  const edge = edges[distances.indexOf(Math.min(...distances))];
  return {
    edge,
    ratio: edge === "left" || edge === "right" ? (height ? y / height : 0) : width ? x / width : 0,
  };
}

export function assistantPanelRect(dock: AssistantDock, viewport: AssistantViewport) {
  const compact = viewport.width < 640;
  if (!compact) {
    const margin = Math.min(viewport.width >= 1024 ? 24 : 16, viewport.height / 4);
    const width = Math.min(480, viewport.width - margin * 2);
    const height = Math.min(760, viewport.height - margin * 2);
    const launcher = assistantDockPoint(dock, viewport);
    const left =
      dock.edge === "left"
        ? margin
        : dock.edge === "right"
          ? viewport.width - width - margin
          : Math.max(
              margin,
              Math.min(
                viewport.width - width - margin,
                launcher.x + ASSISTANT_LAUNCHER_SIZE / 2 - width / 2,
              ),
            );
    const top =
      dock.edge === "top"
        ? margin
        : dock.edge === "bottom"
          ? viewport.height - height - margin
          : (viewport.height - height) / 2;
    return { left: viewport.left + left, top: viewport.top + top, width, height };
  }
  return {
    left: viewport.left,
    top: viewport.top,
    width: viewport.width,
    height: viewport.height,
  };
}

export function assistantBubbleRect(dock: AssistantDock, viewport: AssistantViewport) {
  const point = assistantDockPoint(dock, viewport);
  const margin = 12;
  const width = Math.min(224, Math.max(0, viewport.width - ASSISTANT_LAUNCHER_SIZE - margin * 2));
  const height = 56;
  const x =
    dock.edge === "right"
      ? point.x - width - margin
      : dock.edge === "left"
        ? point.x + ASSISTANT_LAUNCHER_SIZE + margin
        : point.x + ASSISTANT_LAUNCHER_SIZE / 2 - width / 2;
  const y =
    dock.edge === "top"
      ? point.y + ASSISTANT_LAUNCHER_SIZE + margin
      : dock.edge === "bottom"
        ? point.y - height - margin
        : point.y + ASSISTANT_LAUNCHER_SIZE / 2 - height / 2;
  return {
    left: viewport.left + Math.max(margin, clamp(x, viewport.width - width - margin)),
    top: viewport.top + Math.max(margin, clamp(y, viewport.height - height - margin)),
    width,
  };
}
