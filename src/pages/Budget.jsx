import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://projectops-orch-bcgfbkbedsdmf6dm.uaenorth-01.azurewebsites.net";

export default function Budget() {
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // What-if simulator
  const [additionalExpense, setAdditionalExpense] = useState(0);
  const [costIncrease, setCostIncrease] = useState(0);

  useEffect(() => {
    async function loadBudget() {
      try {
        const [budgetResponse, expensesResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/finance/budget?project_id=PROJ-001`
            ),
            fetch(
              `${API_URL}/finance/expenses?project_id=PROJ-001`
            ),
          ]);

        if (!budgetResponse.ok || !expensesResponse.ok) {
          throw new Error("Failed to load budget data");
        }

        const budgetData = await budgetResponse.json();
        const expensesData = await expensesResponse.json();

        setBudget(budgetData.data);
        setExpenses(
          expensesData.data?.expenses || []
        );
      } catch (err) {
        console.error(err);
        setError(
          "Couldn't load budget data from ProjectOps AI."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBudget();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-2xl font-medium mb-1">
          Budget Command Center
        </h1>

        <p className="text-sm text-muted">
          Loading budget data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="font-display text-2xl font-medium mb-1">
          Budget Command Center
        </h1>

        <p className="text-sm text-rose-text">
          {error}
        </p>
      </div>
    );
  }

  const total = Number(
    budget?.total_budget || 0
  );

  const spent = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount || 0),
    0
  );

  const remaining = total - spent;

  const utilization =
    total > 0
      ? (spent / total) * 100
      : 0;

  // ----------------------------------------
  // WHAT-IF SIMULATION
  // ----------------------------------------

  const simulatedSpent =
    (spent + Number(additionalExpense || 0)) *
    (1 + Number(costIncrease || 0) / 100);

  const simulatedRemaining =
    total - simulatedSpent;

  const simulatedUtilization =
    total > 0
      ? (simulatedSpent / total) * 100
      : 0;

  const simulationStatus =
    simulatedUtilization <= 25
      ? "Healthy"
      : simulatedUtilization <= 60
      ? "Moderate"
      : simulatedUtilization <= 100
      ? "High usage"
      : "Over budget";

  // ----------------------------------------
  // CATEGORY BREAKDOWN
  // ----------------------------------------

  const categoryMap = {};

  expenses.forEach((expense) => {
    const category =
      expense.category || "Other";

    if (!categoryMap[category]) {
      categoryMap[category] = 0;
    }

    categoryMap[category] += Number(
      expense.amount || 0
    );
  });

  const categories = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      spent: amount,
    }))
    .sort((a, b) => b.spent - a.spent);

  // ----------------------------------------
  // RECENT EXPENSES
  // ----------------------------------------

  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.expense_date) -
        new Date(a.expense_date)
    )
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-medium mb-1">
          Budget Command Center
        </h1>

        <p className="text-sm text-muted">
          Monitor project spending, financial health,
          and expense activity.
        </p>
      </div>

      {/* Budget metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Total budget
          </p>

          <p className="text-xl font-medium mt-1">
            ${total.toLocaleString()}
          </p>
        </div>

        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Spent
          </p>

          <p className="text-xl font-medium mt-1">
            ${spent.toLocaleString()}
          </p>
        </div>

        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Remaining
          </p>

          <p className="text-xl font-medium text-emerald-text mt-1">
            ${remaining.toLocaleString()}
          </p>
        </div>

        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Budget used
          </p>

          <p className="text-xl font-medium mt-1">
            {utilization.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Budget health */}
      <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium">
              Spending health
            </p>

            <p className="text-xs text-muted mt-0.5">
              {`$${spent.toLocaleString()} spent of $${total.toLocaleString()}`}
            </p>
          </div>

          <span
            className={`text-xs font-medium ${
              utilization <= 25
                ? "text-emerald-text"
                : utilization <= 60
                ? "text-amber-text"
                : "text-rose-text"
            }`}
          >
            {utilization <= 25
              ? "Healthy"
              : utilization <= 60
              ? "Moderate"
              : "High usage"}
          </span>
        </div>

        <div className="h-2 bg-paper rounded overflow-hidden">
          <div
            className="h-full bg-teal rounded"
            style={{
              width: `${Math.min(
                utilization,
                100
              )}%`,
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-xs text-muted">
            0%
          </span>

          <span className="text-xs text-muted">
            100%
          </span>
        </div>
      </div>

      {/* Budget Agent */}
      <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              Budget Agent
            </p>

            <p className="text-xs text-muted mt-1">
              Ask about spending, remaining budget,
              expenses, burn rate, or financial status.
            </p>
          </div>

          <button
            onClick={() =>
              (window.location.href = "/")
            }
            className="text-xs font-medium px-3 py-2 rounded bg-indigo-bg text-indigo-text hover:opacity-80"
          >
            Ask ProjectOps AI →
          </button>
        </div>
      </div>

      {/* What-if simulator */}
      <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">
        <div className="mb-4">
          <p className="text-sm font-medium">
            What-if Budget Simulator
          </p>

          <p className="text-xs text-muted mt-0.5">
            Explore hypothetical spending scenarios without
            changing the actual project budget.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">
                Additional expense
              </label>

              <div className="flex items-center">
                <span className="text-xs text-muted mr-2">
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  value={additionalExpense}
                  onChange={(e) =>
                    setAdditionalExpense(
                      e.target.value
                    )
                  }
                  className="w-full border border-hairline rounded px-3 py-2 text-sm outline-none bg-surface"
                  placeholder="5000"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">
                Increase in future spending
              </label>

              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  value={costIncrease}
                  onChange={(e) =>
                    setCostIncrease(e.target.value)
                  }
                  className="w-full border border-hairline rounded px-3 py-2 text-sm outline-none bg-surface"
                  placeholder="10"
                />

                <span className="text-xs text-muted ml-2">
                  %
                </span>
              </div>
            </div>

            <p className="text-xs text-muted">
              Adjust the values to instantly see how the
              scenario affects the project's financial position.
            </p>
          </div>

          {/* Results */}
          <div className="border border-hairline rounded px-4 py-3">
            <p className="text-xs text-muted mb-3">
              Projected outcome
            </p>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-muted">
                  Projected spending
                </span>

                <span className="text-sm font-medium">
                  $
                  {Math.round(
                    simulatedSpent
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-muted">
                  Projected remaining
                </span>

                <span
                  className={`text-sm font-medium ${
                    simulatedRemaining < 0
                      ? "text-rose-text"
                      : "text-emerald-text"
                  }`}
                >
                  $
                  {Math.round(
                    simulatedRemaining
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-xs text-muted">
                  Projected utilization
                </span>

                <span className="text-sm font-medium">
                  {simulatedUtilization.toFixed(1)}%
                </span>
              </div>

              <div className="border-t border-hairline pt-3 flex justify-between items-center">
                <span className="text-xs text-muted">
                  Scenario status
                </span>

                <span
                  className={`text-xs font-medium ${
                    simulationStatus === "Healthy"
                      ? "text-emerald-text"
                      : simulationStatus === "Moderate"
                      ? "text-amber-text"
                      : "text-rose-text"
                  }`}
                >
                  {simulationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spending and expenses */}
      <div className="grid grid-cols-2 gap-4">

        {/* Category breakdown */}
        <div className="border border-hairline bg-surface rounded px-4 py-4">
          <div className="mb-4">
            <p className="text-sm font-medium">
              Spending by category
            </p>

            <p className="text-xs text-muted mt-0.5">
              Where project funds are currently being used.
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-muted">
              No expenses recorded yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {categories.map((category) => {
                const pct =
                  total > 0
                    ? (category.spent / total) * 100
                    : 0;

                return (
                  <div key={category.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {category.name}
                      </span>

                      <span className="font-mono text-xs text-muted">
                        $
                        {category.spent.toLocaleString()}
                      </span>
                    </div>

                    <div className="h-1.5 bg-paper rounded overflow-hidden">
                      <div
                        className="h-full bg-teal"
                        style={{
                          width: `${Math.min(
                            pct,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent expenses */}
        <div className="border border-hairline bg-surface rounded px-4 py-4">
          <div className="mb-4">
            <p className="text-sm font-medium">
              Recent expenses
            </p>

            <p className="text-xs text-muted mt-0.5">
              Latest recorded project spending.
            </p>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-sm text-muted">
              No expenses recorded yet.
            </p>
          ) : (
            <div className="flex flex-col">
              {recentExpenses.map(
                (expense, index) => (
                  <div
                    key={expense.expense_id}
                    className={`flex items-center justify-between py-3 ${
                      index !==
                      recentExpenses.length - 1
                        ? "border-b border-hairline"
                        : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense.description}
                      </p>

                      <p className="text-xs text-muted mt-0.5">
                        {expense.category || "Other"}
                        {" · "}
                        {expense.expense_date}
                      </p>
                    </div>

                    <span className="text-sm font-medium ml-4">
                      $
                      {Number(
                        expense.amount || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}