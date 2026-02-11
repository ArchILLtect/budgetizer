import { create } from "zustand";
import { isDemoTourDisabled, setDemoTourDisabled } from "../services/demoTour";

type DemoTourState = {
  open: boolean;
  disabled: boolean;

  setOpen: (open: boolean) => void;
  openTour: () => void;
  closeTour: () => void;

  setDisabled: (disabled: boolean) => void;
  resetDisabled: () => void;
  refreshDisabledFromStorage: () => void;
};

export const useDemoTourStore = create<DemoTourState>()((set) => ({
  open: false,
  disabled: isDemoTourDisabled(),

  setOpen: (open) => set({ open }),
  openTour: () => set({ open: true }),
  closeTour: () => set({ open: false }),

  setDisabled: (disabled) => {
    setDemoTourDisabled(disabled);
    set({ disabled, open: false });
  },

  resetDisabled: () => {
    setDemoTourDisabled(false);
    set({ disabled: false });
  },

  refreshDisabledFromStorage: () => {
    set({ disabled: isDemoTourDisabled() });
  },
}));
