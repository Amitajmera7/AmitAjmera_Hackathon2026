import { Card } from "./ui/Card";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const priorityStyles = {
  High: {
    chip: "bg-rose-50 text-rose-800 ring-rose-100",
    stripe: "bg-rose-500",
  },
  Medium: {
    chip: "bg-amber-50 text-amber-900 ring-amber-100",
    stripe: "bg-amber-500",
  },
  Low: {
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
    stripe: "bg-slate-400",
  },
};

function sortByPriority(actions) {
  return [...actions].sort(
    (a, b) =>
      (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );
}

export function FollowUpPanel({ actions, placeholder }) {
  if (placeholder) {
    return (
      <Card title="Follow-up actions" eyebrow="Next steps">
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
          {placeholder}
        </p>
      </Card>
    );
  }

  const sorted = sortByPriority(actions);

  return (
    <Card title="Follow-up actions" eyebrow="Next steps">
      <ul className="flex flex-col gap-3">
        {sorted.map((action, index) => {
          const styles = priorityStyles[action.priority] ?? priorityStyles.Low;
          return (
            <li
              key={`${action.title}-${index}`}
              className="flex overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-900/5"
            >
              <span
                className={`w-1 shrink-0 ${styles.stripe}`}
                aria-hidden
              />
              <div className="flex flex-1 flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{action.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {action.description}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${styles.chip}`}
                >
                  {action.priority}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
