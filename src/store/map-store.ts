import { create } from "zustand";
import type { LatLng } from "@/lib/coords";

type FlyTarget = LatLng & { zoom?: number; marker: boolean; id: number };

type MapStore = {
  /** Last camera request from outside the map (search, my location). */
  flyTarget: FlyTarget | null;
  flyTo: (target: Omit<FlyTarget, "id">) => void;
};

let nextId = 1;

export const useMapStore = create<MapStore>((set) => ({
  flyTarget: null,
  flyTo: (target) => set({ flyTarget: { ...target, id: nextId++ } }),
}));
