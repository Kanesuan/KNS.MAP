// Turns feature properties into one plain Thai sentence per layer.
// Each function returns null when the properties carry nothing to say.
import { format, t, th } from "@/i18n/th";

type Props = Record<string, unknown>;
type Ctx = { distanceM: number };

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function isKey<T extends object>(obj: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/** "850 เมตร" under 1 km, otherwise "1.2 กิโลเมตร". */
export function formatDistance(m: number): string {
  if (m < 1000) return format("describe.meters", { n: Math.max(10, Math.round(m / 10) * 10) });
  return format("describe.kilometers", { n: (Math.round(m / 100) / 10).toLocaleString("th-TH") });
}

export function describeZoning(props: Props): string | null {
  const zone = str(props.zone);
  const category = str(props.category);
  if (!zone || !category || !isKey(th.describe.zoningCategory, category)) return null;
  return format("describe.zoning", { category: t(`describe.zoningCategory.${category}`), zone });
}

export function describePlannedRoad(props: Props, ctx: Ctx): string | null {
  const code = str(props.code);
  const width = num(props.widthM);
  if (!code || width === null) return null;
  return format("describe.plannedRoad", { code, width, distance: Math.round(ctx.distanceM) });
}

export function describeSubsidence(props: Props): string | null {
  const rate = str(props.rateClass);
  if (!rate || !isKey(th.describe.subsidence, rate)) return null;
  return t(`describe.subsidence.${rate}`);
}

export function describeRailStation(props: Props, ctx: Ctx): string | null {
  const name = str(props.name);
  if (!name) return null;
  return format("describe.railStation", { name, distance: formatDistance(ctx.distanceM) });
}

export function describeAdmin(props: Props): string | null {
  const name = str(props.name);
  const province = str(props.province);
  if (!name || !province) return null;
  return province === "กรุงเทพมหานคร"
    ? format("describe.adminBkk", { name })
    : format("describe.admin", { name, province });
}

/** Expects the FloodRecurrence object returned by /api/inspect. */
export function describeFloodRecurrence(props: Props): string | null {
  const years = Array.isArray(props.floodYears)
    ? props.floodYears.filter((y): y is number => typeof y === "number")
    : null;
  const from = num(props.firstYear);
  const to = num(props.lastYear);
  if (!years || from === null || to === null) return null;
  const history =
    years.length > 0
      ? format("describe.floodYes", { count: years.length, from, to, years: years.join(", ") })
      : format("describe.floodNo", { from, to });
  const subdistrict = str(props.subdistrict);
  const district = str(props.district);
  const province = str(props.province);
  if (!subdistrict || !district || !province) return history;
  const place = format(
    province === "กรุงเทพมหานคร" ? "describe.floodPlaceBkk" : "describe.floodPlace",
    {
      subdistrict,
      district,
      province,
    },
  );
  return `${history} · ${place}`;
}
