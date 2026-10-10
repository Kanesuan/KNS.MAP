import { create } from "zustand";

/** Which bottom sheet is open on mobile. Only one at a time. */
type Sheet = "layers" | "inspect" | null;

type UiStore = {
  sheet: Sheet;
  setSheet: (sheet: Sheet) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  sheet: null,
  setSheet: (sheet) => set({ sheet }),
}));
