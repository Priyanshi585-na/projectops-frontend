export default function MetricCard({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "bg-surface border-hairline",
    danger: "bg-rose-bg border-rose-bg text-rose-text",
    warn: "bg-amber-bg border-amber-bg text-amber-text"
  };
  return (
    <div className={`border rounded px-4 py-3.5 ${toneClasses[tone]}`}>
      <p className={`text-xs mb-1 ${tone === "default" ? "text-muted" : "opacity-80"}`}>{label}</p>
      <p className="font-mono text-2xl font-medium">{value}</p>
    </div>
  );
}
