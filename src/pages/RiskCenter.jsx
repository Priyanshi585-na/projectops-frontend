import { useEffect, useState } from "react";
import RiskSignalCard from "../components/RiskSignalCard.jsx";

const API_URL =
  "https://projectops-orch-bcgfbkbedsdmf6dm.uaenorth-01.azurewebsites.net";

export default function RiskCenter() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRisks() {
      try {
        const response = await fetch(
          `${API_URL}/risk/signals?project_id=PROJ-001`
        );

        if (!response.ok) {
          throw new Error(`Failed to load risks: ${response.status}`);
        }

        const data = await response.json();
        setRiskData(data);
      } catch (err) {
        setError("Couldn't load risk analysis from ProjectOps AI.");
      } finally {
        setLoading(false);
      }
    }

    loadRisks();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-medium mb-1">
          Risk center
        </h1>
        <p className="text-sm text-muted mb-5">
          Live analysis of project health, workload and potential risks.
        </p>

        <div className="border border-hairline bg-surface rounded-lg px-4 py-6 text-sm text-muted">
          Analyzing project risks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-medium mb-1">
          Risk center
        </h1>

        <div className="border border-hairline bg-surface rounded-lg px-4 py-6 text-sm text-rose-text">
          {error}
        </div>
      </div>
    );
  }

  const risks = riskData?.observable_risks || [];
  const summary = riskData?.task_summary;
  const workload = riskData?.risk_signals?.over_allocation?.workload || [];
  const budget = riskData?.budget;

  const highRisks = risks.filter(
    (risk) => risk.severity === "high"
  ).length;

  const mediumRisks = risks.filter(
    (risk) => risk.severity === "medium"
  ).length;

  const formatRiskType = (type) =>
    type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div>
      {/* Header */}
      <h1 className="font-display text-2xl font-medium mb-1">
        Risk center
      </h1>

      <p className="text-sm text-muted mb-5">
        Live analysis of project health, workload and potential risks.
      </p>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
          <p className="text-xs text-muted">Active signals</p>
          <p className="text-2xl font-medium mt-1">
            {risks.length}
          </p>
        </div>

        <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
          <p className="text-xs text-muted">High severity</p>
          <p className="text-2xl font-medium text-rose-text mt-1">
            {highRisks}
          </p>
        </div>

        <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
          <p className="text-xs text-muted">Medium severity</p>
          <p className="text-2xl font-medium text-amber-text mt-1">
            {mediumRisks}
          </p>
        </div>
      </div>

      {/* Observable risks */}
      <div className="mb-5">
        <h2 className="text-sm font-medium mb-2.5">
          Observable risks
        </h2>

        {risks.length === 0 ? (
          <div className="border border-hairline bg-surface rounded-lg px-4 py-5 text-sm text-muted">
            No active risk signals detected.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {risks.map((risk, index) => (
              <RiskSignalCard
                key={`${risk.type}-${index}`}
                signal={{
                  id: `${risk.type}-${index}`,
                  type: formatRiskType(risk.type),
                  severity: risk.severity,
                  detail: `${risk.count} affected task${
                    risk.count === 1 ? "" : "s"
                  }.`,
                  icon:
                    risk.severity === "high"
                      ? "ti-alert-triangle"
                      : risk.severity === "medium"
                      ? "ti-alert-circle"
                      : "ti-info-circle",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task health */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
          <h2 className="text-sm font-medium mb-3">
            Task health
          </h2>

          <div className="flex justify-between text-sm py-2 border-t border-hairline">
            <span className="text-muted">Total tasks</span>
            <span>{summary?.total_tasks ?? "—"}</span>
          </div>

          <div className="flex justify-between text-sm py-2 border-t border-hairline">
            <span className="text-muted">Overdue</span>
            <span className={summary?.overdue_tasks > 0 ? "text-rose-text" : ""}>
              {summary?.overdue_tasks ?? "—"}
            </span>
          </div>
        </div>

        {/* Budget health */}
        <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
          <h2 className="text-sm font-medium mb-3">
            Budget health
          </h2>

          <div className="flex justify-between text-sm py-2 border-t border-hairline">
            <span className="text-muted">Budget</span>
            <span>
              ${Number(budget?.budget_total || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm py-2 border-t border-hairline">
            <span className="text-muted">Spent</span>
            <span>
              ${Number(budget?.total_expenses || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm py-2 border-t border-hairline">
            <span className="text-muted">Used</span>
            <span>
              {budget?.budget_used_percentage ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Workload */}
      <div className="border border-hairline bg-surface rounded-lg px-4 py-4 mb-5">
        <h2 className="text-sm font-medium mb-3">
          Team workload
        </h2>

        {workload.length === 0 ? (
          <p className="text-sm text-muted">
            No workload data available.
          </p>
        ) : (
          <div>
            {workload.map((member) => (
              <div
                key={member.member_id}
                className="flex items-center justify-between py-2 border-t border-hairline"
              >
                <div>
                  <p className="text-sm">
                    {member.name}
                  </p>
                  <p className="text-xs text-muted">
                    {member.role}
                  </p>
                </div>

                <span className="text-sm font-medium">
                  {member.assigned_tasks} task
                  {member.assigned_tasks === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measurement limitations */}
      <div className="border border-hairline bg-surface rounded-lg px-4 py-4">
        <h2 className="text-sm font-medium mb-2">
          Analysis coverage
        </h2>

        <p className="text-xs text-muted mb-3">
          Some risk categories require data that is not currently stored
          in the project database.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2 py-1 rounded bg-hairline text-muted">
            Task staleness · unavailable
          </span>

          <span className="text-xs px-2 py-1 rounded bg-hairline text-muted">
            Scope creep · unavailable
          </span>

          <span className="text-xs px-2 py-1 rounded bg-hairline text-muted">
            Dependencies · unavailable
          </span>

          <span className="text-xs px-2 py-1 rounded bg-amber-bg text-amber-text">
            Workload · partial
          </span>
        </div>
      </div>
    </div>
  );
}