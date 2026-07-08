import { useEffect, useState } from "react";

const SIDEBAR_WIDTH_KEY = "arok:sidebarWidth";
const SIDEBAR_COLLAPSED_KEY = "arok:sidebarCollapsed";
const MIN_SIDEBAR_WIDTH = 72;
const MAX_SIDEBAR_WIDTH = 320;
const DEFAULT_SIDEBAR_WIDTH = 240;
const COMPACT_SIDEBAR_WIDTH = 150;
const COLLAPSE_DRAG_THRESHOLD = 16;

export interface UseSidebarStateReturn {
  sidebarWidth: number;
  isSidebarCompact: boolean;
  isSidebarCollapsed: boolean;
  isResizingSidebar: boolean;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  handleResizeStart: (e: React.MouseEvent) => void;
}

export function useSidebarState(): UseSidebarStateReturn {
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY));
    return saved >= MIN_SIDEBAR_WIDTH && saved <= MAX_SIDEBAR_WIDTH ? saved : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  );
  const isSidebarCompact = sidebarWidth <= COMPACT_SIDEBAR_WIDTH;

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < COLLAPSE_DRAG_THRESHOLD) {
        setIsSidebarCollapsed(true);
        setIsResizingSidebar(false);
        return;
      }
      const nextWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, e.clientX));
      setSidebarWidth(nextWidth);
    };
    const handleMouseUp = () => setIsResizingSidebar(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingSidebar]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  return {
    sidebarWidth,
    isSidebarCompact,
    isSidebarCollapsed,
    isResizingSidebar,
    collapseSidebar: () => setIsSidebarCollapsed(true),
    expandSidebar: () => setIsSidebarCollapsed(false),
    handleResizeStart,
  };
}
