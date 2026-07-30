import { create } from "zustand";

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
  setMobileOpen: (open: boolean) => set({ isMobileOpen: open }),
  closeMobile: () => set({ isMobileOpen: false }),
}));
