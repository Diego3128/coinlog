export default function AdminPage() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-base-100 rounded-box border border-base-200 shadow-sm">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-base-content tracking-tight">
          Budgets
        </h2>
        <p className="text-sm text-base-content/70 mt-1">
          Manage your budgets
        </p>
      </div>

      {/* Action Button */}
      <div>
        <button className="btn btn-primary font-semibold shadow-xs">
          Create Budget
        </button>
      </div>
    </div>
  );
}