const severityStyles = {
  high: "border-l-rose bg-rose-bg text-rose-text",
  medium: "border-l-amber bg-amber-bg text-amber-text",
  low: "border-l-indigo bg-indigo-bg text-indigo-text"
};

export default function RiskSignalCard({ signal }) {
  return (
    <div className={`flex items-start gap-3 border-l-[3px] rounded-r px-3.5 py-3 ${severityStyles[signal.severity]}`}>
      <i className={`ti ${signal.icon} text-base mt-0.5`} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">{signal.type}</p>
        <p className="text-sm opacity-90 mt-0.5">{signal.detail}</p>
      </div>
    </div>
  );
}
