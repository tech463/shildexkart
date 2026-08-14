import { API_ORIGIN } from "../config/env";

export const BANNER_POSITIONS = [
  { label: "Home Tier 1 — Hero Slider", value: "HOME_SLIDER" },
  { label: "Home Tier 2 — Featured Banner", value: "HOME_TOP" },
  { label: "Home Tier 3 — Promo Duo", value: "HOME_MIDDLE" },
  { label: "Category Banner", value: "CATEGORY" },
  { label: "Offer Banner", value: "OFFER" },
];

export const POSITION_LABELS = Object.fromEntries(
  BANNER_POSITIONS.map((item) => [item.value, item.label])
);

export function positionLabel(value) {
  return POSITION_LABELS[value] || value || "—";
}

export function positionValue(labelOrValue) {
  const raw = String(labelOrValue || "").trim();
  const byValue = BANNER_POSITIONS.find((item) => item.value === raw);
  if (byValue) return byValue.value;
  const byLabel = BANNER_POSITIONS.find(
    (item) => item.label.toLowerCase() === raw.toLowerCase()
  );
  if (byLabel) return byLabel.value;
  const legacyMap = {
    "Home Tier 1": "HOME_SLIDER",
    "Home Tier 2": "HOME_TOP",
    "Home Tier 3": "HOME_MIDDLE",
    "Main Category": "CATEGORY",
    Category: "CATEGORY",
    Footer: "OFFER",
  };
  return legacyMap[raw] || raw || "HOME_SLIDER";
}

export function buildBannerImageUrl(image) {
  if (!image) return "";
  const raw = String(image).trim();
  if (!raw) return "";
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw;

  const filename = raw.replace(/^.*[/\\]/, "").replace(/^\//, "");
  if (!filename) return "";
  if (filename.startsWith("uploads/")) return `${API_ORIGIN}/${filename}`;
  return `${API_ORIGIN}/uploads/banners/${filename}`;
}
