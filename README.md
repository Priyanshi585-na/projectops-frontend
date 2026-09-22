# ProjectOps frontend

A React + Tailwind scaffold for the ProjectOps dashboard: one shell, one "ask"
bar that routes to your orchestrator, and a page per agent domain.

## Run it

```
npm install
npm run dev
```

Opens at http://localhost:5173. Everything works right now against mock data
in `src/data/mockData.js`, so the whole team can see a working UI before the
backend is ready.

## Structure

```
src/
  components/
    Sidebar.jsx           left nav
    AskBar.jsx             the orchestrator entry point (single ask box)
    AgentBadge.jsx          "answered by X agent" tag
    MetricCard.jsx          small stat readout
    RiskSignalCard.jsx      one risk signal row, color-coded by severity
    AssignConfirmCard.jsx   propose -> confirm -> notify flow for task assignment
  pages/
    Overview.jsx    landing dashboard, one card per agent
    Tasks.jsx        task list + assignment suggestion
    Budget.jsx        spend by category
    Knowledge.jsx      open Q&A / what-if
    RiskCenter.jsx      full list of predictive signals
  data/
    mockData.js    swap this for real API calls
```

## Wiring up the real backend

Two places are the actual integration points, both already marked with
comments in the code:

1. **`src/components/AskBar.jsx`** — `askOrchestrator(query)`. Replace the
   mock logic with a `fetch` to your orchestrator's endpoint. It should
   return which agent answered (`agentKey`: one of `task`, `budget`,
   `knowledge`, `risk`) and the answer text, so the UI can show the right
   badge.

2. **`src/components/AssignConfirmCard.jsx`** — `handleConfirm()`. Replace
   with a `fetch` to your task agent's assign endpoint. Only call it after
   the user clicks "Confirm and assign" — don't send Slack/email/Discord
   notifications on a suggestion alone.

Everywhere else (Budget, Risk center, Tasks list) just swap the imports from
`mockData.js` for real API calls or a small data-fetching hook per page —
the components themselves don't need to change shape.

## Design tokens

Colors and fonts are defined once in `tailwind.config.js`. Each agent has a
consistent color used everywhere it shows up (badges, cards, nav):

- Task / Knowledge — indigo
- Budget — teal
- Risk — rose (high/medium severity), indigo (low)

Keep new UI within these tokens rather than introducing new colors, so the
dashboard stays coherent as more features get added.
