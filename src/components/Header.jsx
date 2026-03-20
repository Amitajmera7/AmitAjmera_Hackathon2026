import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 shadow-sm shadow-slate-900/[0.03] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link to="/" className="group min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Call intelligence OS
            </p>
            <h1 className="truncate text-lg font-black tracking-tight text-slate-900 transition group-hover:text-indigo-700 sm:text-xl">
              Call Intelligence Center
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
