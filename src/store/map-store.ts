import { create } from "zustand";
import type { LatLng } from "@/lib/coords";

type FlyTarget = LatLng & { zoom?: number; marker: boolean; id: number };

type MapStore = {
  /** Last camera request from outside the map (search, my location). */
  flyTarget: FlyTarget | null;
  flyTo: (target: Omit<FlyTarget, "id">) => void;
  /** Height in px of the open bottom sheet on mobile, 0 when closed. */
  sheetHeight: number;
  setSheetHeight: (px: number) => void;
};

let nextId = 1;

export const useMapStore = create<MapStore>((set) => ({
  flyTarget: null,
  flyTo: (target) => set({ flyTarget: { ...target, id: nextId++ } }),
  sheetHeight: 0,
  setSheetHeight: (px) => set({ sheetHeight: px }),
}));
