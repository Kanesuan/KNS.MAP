import { create } from "zustand";
import { track } from "@/lib/analytics";
import { enforceExclusive, parseVisibleLayers } from "@/lib/layer-url";
import { LAYERS } from "@/layers/registry";

export type LoadState = "idle" | "loading" | "ready" | "error";

type LayerStore = {
  /** False until the visible layers were read from the URL on the client. */
  initialized: boolean;
  visible: string[];
  opacity: Record<string, number>;
  load: Record<string, LoadState>;
  /** Bumped to ask the map to fetch a layer's data again. */
  reloadToken: Record<string, number>;
  initFromUrl: (search: string) => void;
  setVisible: (ids: string[]) => void;
  toggle: (id: string, on: boolean) => void;
  setOpacity: (id: string, value: number) => void;
  setLoad: (id: string, state: LoadState) => void;
  retry: (id: string) => void;
};

export const useLayerStore = create<LayerStore>((set) => ({
  initialized: false,
  visible: [],
  opacity: Object.fromEntries(LAYERS.map((l) => [l.id, l.defaultOpacity])),
  load: {},
  reloadToken: {},
  initFromUrl: (search) => set({ initialized: true, visible: parseVisibleLayers(search, LAYERS) }),
  setVisible: (ids) => set({ visible: enforceExclusive(ids, LAYERS) }),
  toggle: (id, on) => {
    track({ name: "layer_toggled", layerId: id, on });
    set((s) => {
      if (!on) return { visible: s.visible.filter((v) => v !== id) };
      const group = LAYERS.find((l) => l.id === id)?.exclusiveGroup;
      const kept = group
        ? s.visible.filter((v) => LAYERS.find((l) => l.id === v)?.exclusiveGroup !== group)
        : s.visible;
      return { visible: enforceExclusive([...kept, id], LAYERS) };
    });
  },
  setOpacity: (id, value) => set((s) => ({ opacity: { ...s.opacity, [id]: value } })),
  setLoad: (id, state) => set((s) => ({ load: { ...s.load, [id]: state } })),
  retry: (id) =>
    set((s) => ({
      load: { ...s.load, [id]: "loading" },
      reloadToken: { ...s.reloadToken, [id]: (s.reloadToken[id] ?? 0) + 1 },
    })),
}));
