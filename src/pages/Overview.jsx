import { useEffect, useState } from "react";
import AskBar from "../components/AskBar.jsx";
import MetricCard from "../components/MetricCard.jsx";
import attentionAnalysis from "../data/attention_analysis.json";
import { AlertTriangle, CheckCircle2, CornerDownRight } from "lucide-react";

const API_URL =
  "https://projectops-orch-bcgfbkbedsdmf6dm.uaenorth-01.azurewebsites.net";
 
const STATUS = {
  critical: {
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-text ring-1 ring-inset ring-rose-200",
    icon: "bg-rose-50 text-rose-text",
  },
  default: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-text ring-1 ring-inset ring-amber-200",
    icon: "bg-amber-50 text-amber-text",
  },
};
 
const SEVERITY = {
  high: {
    rail: "border-l-rose-500",
    chip: "bg-rose-50 text-rose-text",
  },
  medium: {
    rail: "border-l-amber-500",
    chip: "bg-amber-50 text-amber-text",
  },
  low: {
    rail: "border-l-slate-300",
    chip: "bg-slate-100 text-muted",
  },
};


export default function Overview() {
  const [openTaskCount, setOpenTaskCount] = useState(0);
  const [remainingPct, setRemainingPct] = useState(0);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [
          tasksResponse,
          budgetResponse,
          riskResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/tasks`),
          fetch(`${API_URL}/finance/remaining?project_id=PROJ-001`),
          fetch(`${API_URL}/risk/signals?project_id=PROJ-001`),
        ]);

        if (!tasksResponse.ok || !budgetResponse.ok) {
          throw new Error("Failed to load overview data");
        }

        const tasksData = await tasksResponse.json();
        const budgetData = await budgetResponse.json();

        const openTasks = tasksData.tasks.filter(
          (task) =>
            task.project_id === "PROJ-001" &&
            task.status !== "Completed"
        );

        setOpenTaskCount(openTasks.length);

        const budget = budgetData.data;

        if (budget?.total_budget > 0) {
          setRemainingPct(
            Math.round(
              (budget.remaining_budget / budget.total_budget) * 100
            )
          );
        }

        // Risk API is independent so a risk failure
        // doesn't break the rest of the Overview.
        if (riskResponse.ok) {
          const riskResult = await riskResponse.json();
          setRiskData(riskResult);
        }
      } catch (error) {
        console.error("Overview loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const risks = riskData?.observable_risks || [];

  const highRisks = risks.filter(
    (risk) => risk.severity === "high"
  );

  const mediumRisks = risks.filter(
    (risk) => risk.severity === "medium"
  );

  const status =
    STATUS[attentionAnalysis.overall_status] ?? STATUS.default;

  return (
    <div>
      <h1 className="font-display text-2xl font-medium mb-1">
        Overview
      </h1>

      <p className="text-sm text-muted mb-5">
        Everything happening across your project, at a glance.
      </p>

      <AskBar />


      {/* Needs Your Attention */}
      <section className="relative overflow-hidden rounded-lg border border-hairline bg-surface shadow-sm mb-3">
      {/* Status bar: the one loud element, colour follows overall status */}
      <div className={`h-1 ${status.bar}`} />
 
      <div className="px-5 py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${status.icon}`}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>
 
            <div>
              <h3 className="text-base font-semibold leading-tight">
                Needs your attention
              </h3>
              <p className="text-xs text-muted mt-1">
                AI-generated project intelligence from the specialist agents.
              </p>
            </div>
          </div>
 
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${status.pill}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status.dot} ${
                attentionAnalysis.overall_status === "critical"
                  ? "motion-safe:animate-pulse"
                  : ""
              }`}
            />
            {attentionAnalysis.overall_status.replace("_", " ")}
          </span>
        </div>
 
        {/* Summary */}
        <p className="text-sm leading-relaxed mb-5 max-w-prose">
          {attentionAnalysis.summary}
        </p>
 
        {/* Items: the left rail encodes severity */}
        <ul className="flex flex-col gap-3">
          {attentionAnalysis.attention_items.map((item) => {
            const sev = SEVERITY[item.severity] ?? SEVERITY.low;
 
            return (
              <li
                key={item.id}
                className={`rounded-md border border-hairline border-l-4 ${sev.rail} px-4 py-3`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
 
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium capitalize ${sev.chip}`}
                  >
                    {item.severity}
                  </span>
                </div>
 
                <div className="mt-3 flex items-start gap-2 rounded bg-slate-50 px-3 py-2">
                  <CornerDownRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed">
                    <span className="font-semibold">Action:</span>{" "}
                    {item.recommended_action}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
 
        {/* Recommended focus */}
        <div className="mt-5 rounded-md bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold mb-2">Recommended focus</p>
 
          <ul className="space-y-1.5">
            {attentionAnalysis.recommended_focus.map((focus, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted"
                  aria-hidden="true"
                />
                <span className="text-xs text-muted leading-relaxed">
                  {focus}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>



      {/* Project metrics */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MetricCard
          label="Open tasks"
          value={loading ? "..." : openTaskCount}
        />

        <MetricCard
          label="Budget remaining"
          value={loading ? "..." : `${remainingPct}%`}
        />

        <MetricCard
          label="Active risk signals"
          value={loading ? "..." : risks.length}
          tone="danger"
        />
      </div>

      {/* Risk summary */}
      <div className="border border-hairline bg-surface rounded px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">
              Risk summary
            </p>

            <p className="text-xs text-muted mt-0.5">
              Current observable risks detected from project data.
            </p>
          </div>

          <button
            onClick={() => (window.location.href = "/risk")}
            className="text-xs font-medium text-indigo-text hover:underline"
          >
            View full analysis →
          </button>
        </div>

        {!riskData ? (
          <p className="text-sm text-muted">
            Risk analysis unavailable.
          </p>
        ) : risks.length === 0 ? (
          <p className="text-sm text-muted">
            No active risk signals detected.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {highRisks.length > 0 && (
              <div className="flex items-center justify-between py-2 border-t border-hairline">
                <span className="text-sm">
                  High-risk signals
                </span>

                <span className="text-xs font-medium text-rose-text">
                  {highRisks.length}
                </span>
              </div>
            )}

            {mediumRisks.length > 0 && (
              <div className="flex items-center justify-between py-2 border-t border-hairline">
                <span className="text-sm">
                  Medium-risk signals
                </span>

                <span className="text-xs font-medium text-amber-text">
                  {mediumRisks.length}
                </span>
              </div>
            )}

            {risks.slice(0, 3).map((risk, index) => (
              <div
                key={`${risk.type}-${index}`}
                className="flex items-center justify-between py-2 border-t border-hairline"
              >
                <span className="text-sm">
                  {risk.type
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>

                <span className="text-xs text-muted">
                  {risk.count} affected
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}