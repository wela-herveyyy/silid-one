"use client";

import { Move, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SilidChatbotIcon } from "@/components/atoms/SilidChatbotIcon";
import { GiyaChatDrawer } from "@/components/organisms/GiyaChatDrawer";
import {
  ASSISTANT_DEFAULT_DOCK,
  ASSISTANT_DOCK_STORAGE_KEY,
  ASSISTANT_HINT_STORAGE_KEY,
  assistantBubbleRect,
  assistantDockPoint,
  assistantPanelRect,
  clampAssistantPoint,
  nearestAssistantDock,
  readAssistantDock,
  type AssistantDock,
  type AssistantDockEdge,
  type AssistantViewport,
} from "@/lib/assistantDock";
import type { UserRole } from "@/types/lms";

const DRAG_THRESHOLD = 6;

const DOCK_EDGE_CLASSES: Record<AssistantDockEdge, string> = {
  left: "rounded-r-2xl border-l-0",
  right: "rounded-l-2xl border-r-0",
  top: "rounded-b-2xl border-t-0",
  bottom: "rounded-t-2xl border-b-0",
};

interface FloatingGiyaWidgetProps {
  role: UserRole;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

export function FloatingGiyaWidget({
  role,
  drawerOpen,
  onOpenDrawer,
  onCloseDrawer,
}: FloatingGiyaWidgetProps) {
  const pathname = usePathname();
  const isHiddenRoute =
    pathname === "/login" || pathname === "/two-factor-auth" || pathname === "/chat";

  const [viewport, setViewport] = useState<AssistantViewport | null>(null);
  const [placement, setPlacement] = useState<AssistantDock>(ASSISTANT_DEFAULT_DOCK);
  const [showMoveHint, setShowMoveHint] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null);

  const gestureRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    target: HTMLButtonElement;
  } | null>(null);
  const draggingRef = useRef(false);
  const dragPointRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntilRef = useRef(0);

  const dismissMoveHint = useCallback(() => {
    setShowMoveHint(false);
    try {
      localStorage.setItem(ASSISTANT_HINT_STORAGE_KEY, "yes");
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveDock = useCallback((dock: AssistantDock) => {
    setPlacement(dock);
    try {
      localStorage.setItem(ASSISTANT_DOCK_STORAGE_KEY, JSON.stringify(dock));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    let rafId = 0;
    const syncInitial = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        try {
          const savedDock = readAssistantDock(
            JSON.parse(localStorage.getItem(ASSISTANT_DOCK_STORAGE_KEY) ?? "null"),
          );
          if (savedDock) setPlacement(savedDock);
          if (localStorage.getItem(ASSISTANT_HINT_STORAGE_KEY) === "yes") {
            setShowMoveHint(false);
          }
        } catch {
          // ignore storage errors
        }
        const visible = window.visualViewport;
        setViewport({
          left: visible?.offsetLeft ?? 0,
          top: visible?.offsetTop ?? 0,
          width: visible?.width ?? window.innerWidth,
          height: visible?.height ?? window.innerHeight,
        });
      });
    };

    const measure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const visible = window.visualViewport;
        setViewport({
          left: visible?.offsetLeft ?? 0,
          top: visible?.offsetTop ?? 0,
          width: visible?.width ?? window.innerWidth,
          height: visible?.height ?? window.innerHeight,
        });
      });
    };

    syncInitial();
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, []);

  const finishDrag = useCallback(
    (pointerId: number, cancelled = false) => {
      const g = gestureRef.current;
      if (!g || g.pointerId !== pointerId) return;
      gestureRef.current = null;
      if (draggingRef.current) {
        suppressClickUntilRef.current = performance.now() + 500;
        if (!cancelled && dragPointRef.current && viewport) {
          saveDock(nearestAssistantDock(dragPointRef.current, viewport));
        }
      }
      draggingRef.current = false;
      dragPointRef.current = null;
      setDragging(false);
      setDragPoint(null);
      if (g.target.hasPointerCapture(pointerId)) {
        g.target.releasePointerCapture(pointerId);
      }
    },
    [saveDock, viewport],
  );

  const onLauncherPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (gestureRef.current || !e.isPrimary || e.button !== 0 || !viewport) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: rect.left - viewport.left,
      y: rect.top - viewport.top,
      target,
    };
    target.setPointerCapture(e.pointerId);
  };

  const onLauncherPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId || !viewport) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;
    if (!draggingRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    e.preventDefault();
    if (!draggingRef.current) {
      draggingRef.current = true;
      setDragging(true);
      dismissMoveHint();
    }
    const nextPt = clampAssistantPoint({ x: g.x + dx, y: g.y + dy }, viewport);
    dragPointRef.current = nextPt;
    setDragPoint(nextPt);
  };

  const onLauncherKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const edgeMap: Record<string, AssistantDockEdge> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "top",
      ArrowDown: "bottom",
    };
    const nextEdge = edgeMap[e.key];
    if (!e.altKey || !nextEdge) return;
    e.preventDefault();
    saveDock({ edge: nextEdge, ratio: placement.ratio ?? 0.65 });
  };

  const onLauncherClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0 && performance.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      return;
    }
    dismissMoveHint();
    onOpenDrawer();
  };

  if (isHiddenRoute || (role !== "Teacher" && role !== "Admin") || !viewport) {
    return null;
  }

  const dockSide = placement.edge;
  const activePoint = dragPoint ?? assistantDockPoint(placement, viewport);
  const launcherStyle = {
    left: `${viewport.left + activePoint.x}px`,
    top:
      !dragPoint && dockSide === "bottom"
        ? `max(${viewport.top}px, calc(${viewport.top + activePoint.y}px - env(safe-area-inset-bottom, 0px)))`
        : `${viewport.top + activePoint.y}px`,
    right: "auto",
    bottom: "auto",
  };

  const bubbleRect = assistantBubbleRect(placement, viewport);
  const bubbleStyle = {
    left: `${bubbleRect.left}px`,
    top: `${bubbleRect.top}px`,
    width: `${bubbleRect.width}px`,
  };

  const panelRect = assistantPanelRect(placement, viewport);
  const panelStyle = {
    left: `${panelRect.left}px`,
    top: `${panelRect.top}px`,
    width: `${panelRect.width}px`,
    height: `${panelRect.height}px`,
  };

  return (
    <>
      {!drawerOpen ? (
        <>
          {showMoveHint && !dragging ? (
            <div
              style={bubbleStyle}
              data-dock-edge={dockSide}
              className="fixed z-[54] hidden min-h-[56px] max-w-[224px] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 text-slate-700 shadow-sm sm:flex"
              role="status"
            >
              <Move className="h-4 w-4 shrink-0 text-orange-600" />
              <p className="min-w-0 flex-1 text-[12px] font-medium leading-[18px]">
                You can move me—just drag me.
              </p>
              <button
                type="button"
                onClick={dismissMoveHint}
                aria-label="Dismiss drag hint"
                className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <button
            type="button"
            style={launcherStyle}
            data-dock-edge={dockSide}
            onPointerDown={onLauncherPointerDown}
            onPointerMove={onLauncherPointerMove}
            onPointerUp={(e) => finishDrag(e.pointerId)}
            onPointerCancel={(e) => finishDrag(e.pointerId, true)}
            onLostPointerCapture={(e) => finishDrag(e.pointerId, true)}
            onKeyDown={onLauncherKeyDown}
            onDragStart={(e) => e.preventDefault()}
            onClick={onLauncherClick}
            aria-label="Open Silid Chatbot"
            aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown"
            title="Ask Silid · Drag to move"
            className={`fixed z-[55] inline-flex h-[48px] w-[48px] touch-none select-none items-center justify-center border border-[#c2410c] bg-[#ea580c] text-white shadow-sm hover:bg-[#c2410c] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              dragging
                ? "cursor-grabbing rounded-2xl transition-none"
                : `cursor-grab transition-[left,top,border-radius,background-color] duration-200 ${DOCK_EDGE_CLASSES[dockSide]}`
            }`}
          >
            <SilidChatbotIcon className="pointer-events-none h-10 w-10" />
          </button>
        </>
      ) : null}

      <GiyaChatDrawer
        open={drawerOpen}
        onClose={onCloseDrawer}
        dockSide={dockSide}
        panelStyle={panelStyle}
      />
    </>
  );
}
