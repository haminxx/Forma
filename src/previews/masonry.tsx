export default function MasonryPreview() {
  const heights = [110, 70, 140, 90, 160, 80, 120, 100, 130];
  return (
    <div
      className="p-4 h-full overflow-auto"
      style={{
        columnCount: 3,
        columnGap: 8,
        background: "rgba(0,0,0,0.2)",
      }}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            breakInside: "avoid",
            marginBottom: 8,
            height: h,
            borderRadius: 8,
            background: `hsl(${(i * 37) % 360} 70% 60% / 0.8)`,
          }}
        />
      ))}
    </div>
  );
}
