const colorMap = {
  indigo: "bg-indigo-bg text-indigo-text",
  teal: "bg-teal-bg text-teal-text",
  rose: "bg-rose-bg text-rose-text",
  amber: "bg-amber-bg text-amber-text"
};

export default function AgentBadge({ name, color }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${colorMap[color]}`}>
      {name}
    </span>
  );
}
