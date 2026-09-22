import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Overview", icon: "ti-layout-dashboard", end: true },
  { to: "/tasks", label: "Tasks", icon: "ti-checklist" },
  { to: "/budget", label: "Budget", icon: "ti-currency-dollar" },
  { to: "/risk", label: "Risk center", icon: "ti-alert-triangle" }
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-hairline bg-surface px-3 py-5 flex flex-col">
      <div className="px-2 mb-8">
        <p className="font-display text-lg font-medium tracking-tight">ProjectOps</p>
        <p className="text-xs text-muted mt-0.5">Team Nebula · Sprint 14</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-indigo-bg text-indigo-text font-medium"
                  : "text-muted hover:bg-paper hover:text-ink"
              }`
            }
          >
            <i className={`ti ${link.icon} text-base`} aria-hidden="true" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-2 pt-4 border-t border-hairline">
        <div className="flex items-center gap-2 text-sm text-muted">
          <div className="w-7 h-7 rounded-full bg-indigo-bg text-indigo-text flex items-center justify-center text-xs font-medium">
            YO
          </div>
          You
        </div>
      </div>
    </aside>
  );
}
