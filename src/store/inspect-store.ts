import { create } from "zustand";
import type { LatLng } from "@/lib/coords";
import { track } from "@/lib/analytics";
import type { CardResult } from "@/lib/inspect";
import { useLayerStore } from "./layer-store";

type InspectStore = {
  point: (LatLng & { id: number }) | null;
  results: Record<string, CardResult>;
  inspect: (point: LatLng) => void;
  setResult: (pointId: number, layerId: string, result: CardResult) => void;
  close: () => void;
};

let nextId = 1;

export const useInspectStore = create<InspectStore>((set) => ({
  point: null,
  results: {},
  inspect: (point) => {
    track({ name: "point_inspected", ...point, visibleLayers: useLayerStore.getState().visible });
    set({ point: { ...point, id: nextId++ }, results: {} });
  },
  // Ignore answers for a point the user has already moved away from.
  setResult: (pointId, layerId, result) =>
    set((s) => (s.point?.id === pointId ? { results: { ...s.results, [layerId]: result } } : s)),
  close: () => set({ point: null, results: {} }),
}));
