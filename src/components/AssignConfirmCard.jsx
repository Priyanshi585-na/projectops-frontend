import { useState } from "react";

const channels = [
  { id: "slack", label: "Slack", icon: "ti-brand-slack" },
  { id: "email", label: "Email", icon: "ti-mail" },
  { id: "discord", label: "Discord", icon: "ti-brand-discord" }
];

export default function AssignConfirmCard({ suggestion }) {
  const [selected, setSelected] = useState(["slack"]);
  const [state, setState] = useState("proposed"); // proposed | confirmed | notified

  function toggleChannel(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  // Wire this to your task agent's confirm endpoint, then to your notifier service:
  // await fetch("/api/tasks/assign", { method: "POST", body: JSON.stringify({ task, person, channels: selected }) });
  async function handleConfirm() {
    setState("confirmed");
    await new Promise((r) => setTimeout(r, 500));
    setState("notified");
  }

  return (
    <div className="border border-hairline bg-surface rounded px-4 py-3.5 max-w-md">
      <p className="text-xs text-muted mb-2.5">Task agent suggests</p>
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-full bg-indigo-bg text-indigo-text flex items-center justify-center text-xs font-medium shrink-0">
          {suggestion.person.initials}
        </div>
        <div>
          <p className="text-sm font-medium">{suggestion.person.name}</p>
          <p className="text-xs text-muted">
            {suggestion.task} — {suggestion.person.matchScore}% match, {suggestion.person.reason}
          </p>
        </div>
      </div>

      {state === "notified" ? (
        <div className="flex items-center gap-2 text-sm text-teal-text bg-teal-bg rounded px-3 py-2">
          <i className="ti ti-check" aria-hidden="true" />
          Assigned and notified via {selected.join(", ")}
        </div>
      ) : (
        <>
          <div className="border-t border-hairline pt-2.5 mb-3">
            <p className="text-xs text-muted mb-1.5">Notify via</p>
            <div className="flex gap-1.5">
              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChannel(c.id)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors ${
                    selected.includes(c.id)
                      ? "bg-indigo-bg text-indigo-text border-indigo-bg"
                      : "border-hairline text-muted hover:text-ink"
                  }`}
                >
                  <i className={`ti ${c.icon} text-sm`} aria-hidden="true" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0 || state === "confirmed"}
              className="flex-1 text-sm font-medium bg-ink text-white rounded px-3 py-2 hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {state === "confirmed" ? "Assigning..." : "Confirm and assign"}
            </button>
            <button className="flex-1 text-sm border border-hairline rounded px-3 py-2 hover:bg-paper transition-colors">
              Pick someone else
            </button>
          </div>
        </>
      )}
    </div>
  );
}
