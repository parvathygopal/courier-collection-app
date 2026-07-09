import { useDashboard } from "../../hooks/useDashboard";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="rounded-xl bg-white shadow-sm border p-10 text-center text-gray-500">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Collection Dashboard
        </h1>

        <p className="mt-2 text-gray-500">
          Overview of package collection and delivery status.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="text-4xl">📦</div>

          <div className="mt-4 text-sm text-gray-500">
            Total Packages
          </div>

          <div className="mt-2 text-3xl font-bold text-indigo-600">
            {data.totalPackages ?? 0}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="text-4xl">📝</div>

          <div className="mt-4 text-sm text-gray-500">
            Created
          </div>

          <div className="mt-2 text-3xl font-bold text-blue-600">
            {data.created ?? 0}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="text-4xl">🚚</div>

          <div className="mt-4 text-sm text-gray-500">
            In Transit
          </div>

          <div className="mt-2 text-3xl font-bold text-amber-600">
            {data.inTransit ?? 0}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
          <div className="text-4xl">✅</div>

          <div className="mt-4 text-sm text-gray-500">
            Delivered
          </div>

          <div className="mt-2 text-3xl font-bold text-green-600">
            {data.delivered ?? 0}
          </div>
        </div>
      </div>
    </main>
  );
}