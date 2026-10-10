"use client";

import { t } from "@/i18n/th";
import { LAYERS } from "@/layers/registry";
import { LAYER_GROUPS } from "@/layers/types";
import { useLayerStore } from "@/store/layer-store";
import { LayerRow } from "./LayerRow";

export function LayerList() {
  const visible = useLayerStore((s) => s.visible);
  const opacity = useLayerStore((s) => s.opacity);
  const load = useLayerStore((s) => s.load);
  const toggle = useLayerStore((s) => s.toggle);
  const setOpacity = useLayerStore((s) => s.setOpacity);
  const retry = useLayerStore((s) => s.retry);

  return (
    <div className="space-y-4">
      {LAYER_GROUPS.map((group) => {
        const layers = LAYERS.filter((l) => l.group === group);
        if (layers.length === 0) return null;
        return (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h3
              id={`group-${group}`}
              className="text-base md:text-sm font-semibold tracking-wide text-neutral-500"
            >
              {t(`panel.groups.${group}`)}
            </h3>
            <ul>
              {layers.map((layer) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  on={visible.includes(layer.id)}
                  opacity={opacity[layer.id] ?? layer.defaultOpacity}
                  load={load[layer.id] ?? "idle"}
                  exclusiveWith={LAYERS.filter(
                    (o) =>
                      o.id !== layer.id &&
                      o.exclusiveGroup &&
                      o.exclusiveGroup === layer.exclusiveGroup,
                  ).map((o) => t(o.name))}
                  onToggle={(on) => toggle(layer.id, on)}
                  onOpacity={(v) => setOpacity(layer.id, v)}
                  onRetry={() => retry(layer.id)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
