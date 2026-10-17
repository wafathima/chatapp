// components/Avatar.tsx
type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
};

// Cartoon fallback colors: each name always gets the same one.
const palette = [
  { bg: "#FF3B2F", fg: "#FFFFFF" },
  { bg: "#FFD93B", fg: "#2B0B0B" },
  { bg: "#FF9F1C", fg: "#2B0B0B" },
  { bg: "#FF8FA3", fg: "#2B0B0B" },
];

function pickColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export default function Avatar({
  name,
  src,
  size = 40,
  online,
}: AvatarProps) {
  // Dot size scales with avatar size a bit, but stays reasonable
  const dot = Math.max(10, Math.round(size * 0.28));
  const outline = size >= 56 ? 4 : 3;
  const shadow = size >= 56 ? 3 : 2;
  const color = pickColor(name);

  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Inner circle: clips the image into a circle, with a cartoon outline */}
      <span
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-full font-bold"
        style={{
          fontSize: size * 0.42,
          backgroundColor: color.bg,
          color: color.fg,
          border: `${outline}px solid #2B0B0B`,
          boxShadow: `${shadow}px ${shadow}px 0 #2B0B0B`,
          textShadow:
            color.fg === "#FFFFFF" ? "1px 1px 0 #2B0B0B" : undefined,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          name.charAt(0).toUpperCase() || "?"
        )}
      </span>

      {/* Status dot: outside the overflow-hidden wrapper, so it never gets clipped */}
      {online !== undefined && (
        <span
          role="img"
          aria-label={online ? "Online" : "Offline"}
          className={`absolute bottom-0 right-0 rounded-full ${
            online ? "bg-emerald-400" : "bg-[#FFF3C4]"
          }`}
          style={{
            width: dot,
            height: dot,
            border: "2px solid #2B0B0B",
            transform: "translate(20%, 20%)",
          }}
        />
      )}
    </span>
  );
}