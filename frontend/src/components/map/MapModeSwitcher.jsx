export default function MapModeSwitcher({ mode, onChange }) {
  const modes = [
    { key: "clusters", label: "CLUSTERS" },
    { key: "heatmap", label: "HEATMAP" },
    { key: "pins", label: "PINS" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 1000,
        display: "flex",
        gap: 4,
        background: "#1a1005",
        border: "1px solid #ea580c",
        borderRadius: 6,
        padding: 4,
      }}
    >
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          style={{
            background: mode === m.key ? "#ea580c" : "transparent",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            fontFamily: "monospace",
            fontSize: 12,
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
