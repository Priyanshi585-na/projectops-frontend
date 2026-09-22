import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://projectops-orch-bcgfbkbedsdmf6dm.uaenorth-01.azurewebsites.net";

const statusStyles = {
  "In Progress": "bg-indigo-bg text-indigo-text",
  Pending: "bg-hairline text-muted",
  Blocked: "bg-rose-bg text-rose-text",
  Completed: "bg-emerald-bg text-emerald-text",
};

function isDueSoon(task) {
  const today = new Date();
  const due = new Date(task.due_date);

  const diff =
    (due - today) / (1000 * 60 * 60 * 24);

  return diff >= 0 && diff <= 3;
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // AI assignment state
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentProposals, setAssignmentProposals] = useState([]);
  const [showAssignmentPanel, setShowAssignmentPanel] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState(null);

  // ---------------------------------------------------------
  // LOAD TASKS
  // ---------------------------------------------------------

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tasks`);

      if (!response.ok) {
        throw new Error(
          `Failed to load tasks: ${response.status}`
        );
      }

      const data = await response.json();

      const projectTasks = data.tasks.filter(
        (task) => task.project_id === "PROJ-001"
      );

      setTasks(projectTasks);
    } catch (err) {
      console.error(err);
      setError("Couldn't load tasks from ProjectOps AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // ---------------------------------------------------------
  // TASK STATS
  // ---------------------------------------------------------

  const stats = useMemo(() => {
    return {
      open: tasks.filter(
        (task) => task.status !== "Completed"
      ).length,

      blocked: tasks.filter(
        (task) => task.status === "Blocked"
      ).length,

      highPriority: tasks.filter(
        (task) =>
          task.priority === "High" &&
          task.status !== "Completed"
      ).length,

      dueSoon: tasks.filter(
        (task) =>
          task.status !== "Completed" &&
          isDueSoon(task)
      ).length,
    };
  }, [tasks]);

  // ---------------------------------------------------------
  // FILTERED TASKS
  // ---------------------------------------------------------

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Active" &&
          task.status === "In Progress") ||
        (filter === "Blocked" &&
          task.status === "Blocked") ||
        (filter === "Pending" &&
          task.status === "Pending") ||
        (filter === "Completed" &&
          task.status === "Completed");

      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.task_id?.toLowerCase().includes(query) ||
        task.assignee_name?.toLowerCase().includes(query) ||
        task.assigned_to?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, search]);

  // ---------------------------------------------------------
  // AI TEAM ASSIGNMENT — PROPOSE
  // ---------------------------------------------------------

  const proposeAssignments = async () => {
    try {
      setAssignmentLoading(true);

      const response = await fetch(
        `${API_URL}/assignment/propose`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: "AI Study Assistant",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to generate assignments"
        );
      }

      const proposals = data.data?.proposals || [];

      setAssignmentProposals(proposals);
      setShowAssignmentPanel(true);

    } catch (error) {
      console.error(
        "Assignment proposal failed:",
        error
      );

      alert(
        error.message ||
        "Failed to generate assignment proposals."
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  // ---------------------------------------------------------
  // APPROVE ONE ASSIGNMENT
  // ---------------------------------------------------------

  const approveAssignment = async (proposal) => {
    try {
      setApprovalLoading(proposal.task_id);

      const response = await fetch(
        `${API_URL}/assignment/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            project_id: "PROJ-001",
            assignments: [
              {
                task_id: proposal.task_id,
                member_id: proposal.proposed_member_id,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to approve assignment"
        );
      }

      // Remove only this approved proposal
      setAssignmentProposals((current) =>
        current.filter(
          (item) =>
            item.task_id !== proposal.task_id
        )
      );

      // Refresh task data from database
      await loadTasks();

    } catch (error) {
      console.error(
        "Assignment approval failed:",
        error
      );

      alert(
        error.message ||
        "Failed to approve assignment."
      );
    } finally {
      setApprovalLoading(null);
    }
  };

  // ---------------------------------------------------------
  // REJECT ONE ASSIGNMENT
  // ---------------------------------------------------------

  const rejectAssignment = (proposal) => {
    setAssignmentProposals((current) =>
      current.filter(
        (item) =>
          item.task_id !== proposal.task_id
      )
    );
  };

  // ---------------------------------------------------------
  // TEAM WORKLOAD
  // ---------------------------------------------------------

  const workload = useMemo(() => {
    const people = {};

    tasks
      .filter(
        (task) => task.status !== "Completed"
      )
      .forEach((task) => {
        const name =
          task.assignee_name ||
          task.assigned_to ||
          "Unassigned";

        if (!people[name]) {
          people[name] = {
            name,
            count: 0,
            blocked: 0,
          };
        }

        people[name].count += 1;

        if (task.status === "Blocked") {
          people[name].blocked += 1;
        }
      });

    return Object.values(people).sort(
      (a, b) => b.count - a.count
    );
  }, [tasks]);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div>

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-display text-2xl font-medium mb-1">
          Task Command Center
        </h1>

        <p className="text-sm text-muted">
          Manage project work, deadlines, blockers, and
          team workload.
        </p>
      </div>


      {/* KPI STRIP */}
      <div className="grid grid-cols-4 gap-3 mb-4">

        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Open tasks
          </p>

          <p className="text-xl font-medium mt-1">
            {loading ? "..." : stats.open}
          </p>
        </div>


        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Blocked
          </p>

          <p className="text-xl font-medium text-rose-text mt-1">
            {loading ? "..." : stats.blocked}
          </p>
        </div>


        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            High priority
          </p>

          <p className="text-xl font-medium mt-1">
            {loading ? "..." : stats.highPriority}
          </p>
        </div>


        <div className="border border-hairline bg-surface rounded px-4 py-3">
          <p className="text-xs text-muted">
            Due soon
          </p>

          <p className="text-xl font-medium text-amber-text mt-1">
            {loading ? "..." : stats.dueSoon}
          </p>
        </div>

      </div>


      {/* AI TEAM ASSIGNMENT */}
      <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium">
              AI Team Assignment
            </p>

            <p className="text-xs text-muted mt-1">
              Let ProjectOps AI analyze skills, workload,
              deadlines, and project requirements to propose
              task assignments.
            </p>
          </div>


          <button
            onClick={proposeAssignments}
            disabled={assignmentLoading}
            className="text-xs font-medium px-3 py-2 rounded bg-indigo-bg text-indigo-text hover:opacity-80 disabled:opacity-50"
          >
            {assignmentLoading
              ? "Analyzing Team..."
              : "Assign Project to Team →"}
          </button>

        </div>

      </div>


      {/* AI PROPOSALS */}
      {showAssignmentPanel && (
        <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">

          <div className="flex items-start justify-between mb-4">

            <div>
              <p className="text-sm font-medium">
                AI Proposed Assignments
              </p>

              <p className="text-xs text-muted mt-1">
                Review each proposed assignment before
                committing it to the project.
              </p>
            </div>


            <button
              onClick={() => {
                setShowAssignmentPanel(false);
                setAssignmentProposals([]);
              }}
              className="text-xs text-muted hover:text-primary"
            >
              Close
            </button>

          </div>


          {assignmentProposals.length === 0 ? (

            <div className="border border-hairline rounded px-3 py-4 text-center">
              <p className="text-sm text-muted">
                No pending assignment proposals.
              </p>
            </div>

          ) : (

            <div className="space-y-2">

              {assignmentProposals.map(
                (proposal) => (

                  <div
                    key={proposal.task_id}
                    className="border border-hairline rounded px-3 py-3"
                  >

                    <div className="flex items-start justify-between gap-4">

                      {/* Proposal details */}
                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <span className="font-mono text-xs text-muted">
                            {proposal.task_id}
                          </span>

                          <p className="text-sm font-medium">
                            {proposal.task_title}
                          </p>

                        </div>


                        <p className="text-xs text-muted mt-1">
                          Proposed →{" "}
                          <span className="font-medium">
                            {proposal.proposed_member_name}
                          </span>
                        </p>


                        <p className="text-xs text-muted mt-2 leading-relaxed">
                          {proposal.reason}
                        </p>

                      </div>


                      {/* Individual actions */}
                      <div className="flex gap-2 shrink-0">

                        <button
                          onClick={() =>
                            rejectAssignment(
                              proposal
                            )
                          }
                          disabled={
                            approvalLoading ===
                            proposal.task_id
                          }
                          className="text-xs px-3 py-2 rounded border border-hairline text-muted hover:bg-hairline disabled:opacity-50"
                        >
                          Reject
                        </button>


                        <button
                          onClick={() =>
                            approveAssignment(
                              proposal
                            )
                          }
                          disabled={
                            approvalLoading ===
                            proposal.task_id
                          }
                          className="text-xs font-medium px-3 py-2 rounded bg-indigo-bg text-indigo-text hover:opacity-80 disabled:opacity-50"
                        >
                          {approvalLoading ===
                          proposal.task_id
                            ? "Applying..."
                            : "Send Email Alert"}
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>
      )}


      {/* TEAM WORKLOAD */}
      <div className="border border-hairline bg-surface rounded px-4 py-4 mb-4">

        <div className="mb-3">

          <p className="text-sm font-medium">
            Team workload
          </p>

          <p className="text-xs text-muted mt-0.5">
            Active work currently assigned to each team
            member.
          </p>

        </div>


        <div className="grid grid-cols-5 gap-3">

          {workload.map((person) => (

            <div
              key={person.name}
              className="border border-hairline rounded px-3 py-2"
            >

              <p className="text-xs font-medium truncate">
                {person.name}
              </p>


              <div className="flex items-center justify-between mt-2">

                <span className="text-lg font-medium">
                  {person.count}
                </span>

                <span className="text-xs text-muted">
                  active
                </span>

              </div>


              {person.blocked > 0 && (
                <p className="text-xs text-rose-text mt-1">
                  {person.blocked} blocked
                </p>
              )}

            </div>

          ))}

        </div>

      </div>


      {/* TASK TABLE */}
      <div className="border border-hairline bg-surface rounded overflow-hidden">

        {/* Controls */}
        <div className="px-4 py-3 border-b border-hairline flex items-center justify-between gap-4">

          <div className="flex gap-1">

            {[
              "All",
              "Active",
              "Blocked",
              "Pending",
              "Completed",
            ].map((item) => (

              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`text-xs px-3 py-1.5 rounded ${
                  filter === item
                    ? "bg-indigo-bg text-indigo-text font-medium"
                    : "text-muted hover:bg-hairline"
                }`}
              >
                {item}
              </button>

            ))}

          </div>


          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search tasks..."
            className="border border-hairline rounded px-3 py-1.5 text-xs outline-none bg-surface"
          />

        </div>


        {/* Loading */}
        {loading && (
          <div className="px-4 py-6 text-sm text-muted">
            Loading tasks...
          </div>
        )}


        {/* Error */}
        {error && (
          <div className="px-4 py-6 text-sm text-rose-text">
            {error}
          </div>
        )}


        {/* Empty */}
        {!loading &&
          !error &&
          filteredTasks.length === 0 && (

            <div className="px-4 py-6 text-sm text-muted">
              No matching tasks.
            </div>

          )}


        {/* Tasks */}
        {!loading &&
          !error &&
          filteredTasks.map(
            (task, index) => (

              <div
                key={task.task_id}
                className={`px-4 py-4 ${
                  index !==
                  filteredTasks.length - 1
                    ? "border-b border-hairline"
                    : ""
                }`}
              >

                <div className="flex items-center justify-between gap-5">

                  {/* Task */}
                  <div className="flex items-start gap-3 min-w-0">

                    <span className="font-mono text-xs text-muted pt-0.5 w-16">
                      {task.task_id}
                    </span>


                    <div className="min-w-0">

                      <p className="text-sm font-medium">
                        {task.title}
                      </p>


                      <p className="text-xs text-muted mt-1">
                        {task.assignee_name ||
                          task.assigned_to ||
                          "Unassigned"}
                      </p>

                    </div>

                  </div>


                  {/* Metadata */}
                  <div className="flex items-center gap-5 shrink-0">

                    {/* Deadline */}
                    {task.status !==
                      "Completed" && (

                      <div className="text-right">

                        <p className="text-xs text-muted">
                          Due
                        </p>

                        <p className="text-xs font-medium mt-0.5">
                          {task.due_date}
                        </p>

                      </div>

                    )}


                    {/* Status */}
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded ${
                        statusStyles[
                          task.status
                        ] ||
                        "bg-hairline text-muted"
                      }`}
                    >
                      {task.status ===
                      "Completed"
                        ? "✓ Completed"
                        : task.status}
                    </span>


                    {/* Priority */}
                    {task.status !==
                      "Completed" &&
                      task.priority ===
                        "High" && (

                        <span className="text-xs font-medium text-rose-text">
                          High
                        </span>

                      )}

                  </div>

                </div>

              </div>

            )
          )}

      </div>

    </div>
  );
}