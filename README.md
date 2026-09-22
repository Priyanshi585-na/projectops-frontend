# ProjectOps frontend

A React + Tailwind scaffold for the ProjectOps dashboard: one shell, one "ask"
bar that routes to your orchestrator, and a page per agent domain.

## Run it

```
npm install
npm run dev
```

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
```

## Design tokens

Colors and fonts are defined once in `tailwind.config.js`. Each agent has a
consistent color used everywhere it shows up (badges, cards, nav):

- Task / Knowledge — indigo
- Budget — teal
- Risk — rose (high/medium severity), indigo (low)

Keep new UI within these tokens rather than introducing new colors, so the
dashboard stays coherent as more features get added.
