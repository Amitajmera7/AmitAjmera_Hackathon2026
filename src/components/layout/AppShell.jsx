export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] bg-slate-100/90">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-100">
        {children}
      </div>
    </div>
  );
}
