import { useState } from "react";
import AgentBadge from "./AgentBadge.jsx";

async function askOrchestrator(query) {
  const response = await fetch(
    "https://projectops-orch-bcgfbkbedsdmf6dm.uaenorth-01.azurewebsites.net/orchestrator/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Orchestrator request failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    agentKey: "orchestrator",
    answer: data.answer,
  };
}


const agents = {
  knowledge: {
    name: "Knowledge Agent",
    color: "indigo",
  },
  task: {
    name: "Task Agent",
    color: "blue",
  },
  budget: {
    name: "Budget Agent",
    color: "green",
  },
  attention: {
    name: "Attention Agent",
    color: "amber",
  },
  orchestrator: {
    name: "Orchestrator",
    color: "purple",
  },
};




export default function AskBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await askOrchestrator(query);
      setResult(res);
    } catch (error) {
      setResult({
        agentKey: "knowledge",
        answer: "Sorry, I couldn't reach the ProjectOps AI backend.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5 border border-hairline bg-surface rounded px-3.5 py-2.5">
        <i className="ti ti-sparkles text-indigo text-base shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything — which tasks are mine, what's our budget status, any risk signals..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="text-xs font-medium bg-ink text-white rounded px-3 py-1.5 hover:opacity-90 transition-opacity disabled:opacity-40"
          disabled={loading}
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {result && (
        <div className="mt-2.5 border border-hairline bg-surface rounded px-3.5 py-3 flex items-start gap-3">
          <AgentBadge name={agents[result.agentKey].name} color={agents[result.agentKey].color} />
          <p className="text-sm text-ink flex-1">{result.answer}</p>
        </div>
      )}
    </div>
  );
}
