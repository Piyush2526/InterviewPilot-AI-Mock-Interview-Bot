import { ROLES, type RoleDef } from "@/lib/interview-roles";
import { ArrowRight, Code2, BarChart3, MonitorSmartphone, Clock } from "lucide-react";

const icons = {
  "sde-intern": Code2,
  "data-analyst": BarChart3,
  "frontend-developer": MonitorSmartphone,
} as const;

export function RolePicker({ onSelect }: { onSelect: (role: RoleDef) => void }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Mock interview studio
        </p>
        <h1 className="mt-4 text-5xl leading-[1.05] text-foreground">
          Practice the interview
          <span className="block text-navy-soft italic">before it counts.</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Five timed questions, an AI interviewer that adapts to your role, and a scored report card
          with a model answer at the end. Pick a track to begin.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {ROLES.map((role) => {
          const Icon = icons[role.id];
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelect(role)}
              className="card-elevated group flex flex-col items-start p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="surface-navy flex size-11 items-center justify-center rounded-lg">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <h2 className="mt-5 text-xl text-foreground">{role.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {role.blurb}
              </p>
              <div className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {role.duration}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Start <ArrowRight className="size-3.5" />
                </span>
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {role.focus}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}