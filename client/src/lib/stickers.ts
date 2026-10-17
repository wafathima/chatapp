// lib/stickers.ts
const BASE = "https://api.dicebear.com/7.x";

// Each name makes a different sticker in every pack.
const NAMES = [
  "Felix", "Aneka", "Destiny", "Jocelyn", "Leo", "Mason",
  "Nora", "Oliver", "Bella", "Max", "Sadie", "Jack",
  "Luna", "Milo", "Zoe", "Finn", "Ruby", "Oscar",
  "Chloe", "Jasper", "Daisy", "Toby", "Piper", "Rocky",
];

export type StickerPack = {
  id: string;
  label: string;
  stickers: string[];
};

function makePack(id: string, label: string, style: string): StickerPack {
  return {
    id,
    label,
    stickers: NAMES.map(
      (seed) =>
        `${BASE}/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`
    ),
  };
}

export const STICKER_PACKS: StickerPack[] = [
  makePack("faces", "😜 Faces", "fun-emoji"),
  makePack("robots", "🤖 Robots", "bottts-neutral"),
  makePack("smiles", "😁 Smiles", "big-smile"),
  makePack("thumbs", "👍 Thumbs", "thumbs"),
  makePack("pixel", "👾 Pixel", "pixel-art-neutral"),
  makePack("doodles", "✏️ Doodles", "croodles-neutral"),
];


export function parseSticker(content: string): string | null {
  if (!content.startsWith("[sticker:") || !content.endsWith("]")) return null;
  const url = content.slice("[sticker:".length, -1);
  return url.startsWith(`${BASE}/`) ? url : null;
}

/** Short text for notifications and the sidebar preview. */
export function messagePreview(content: string, max = 60): string {
  return parseSticker(content) ? "🎨 Sticker" : content.slice(0, max);
}