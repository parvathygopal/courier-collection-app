import { useDashboard } from "../../hooks/useDashboard";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();

  return (
    <div className="container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="card">
        {isLoading || !data ? (
          <div className="loader">Loading dashboard…</div>
        ) : (
          <nav className="flex flex-wrap gap-4">
            <div className="p-4 rounded-lg shadow-sm bg-white w-44">
              <div className="text-sm text-gray-500">Total Packages</div>
              <div className="mt-2 text-xl font-semibold text-gray-800">
                {data.totalPackages ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-lg shadow-sm bg-white w-44">
              <div className="text-sm text-gray-500">Created</div>
              <div className="mt-2 text-xl font-semibold text-gray-800">
                {data.created ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-lg shadow-sm bg-white w-44">
              <div className="text-sm text-gray-500">In Transit</div>
              <div className="mt-2 text-xl font-semibold text-gray-800">
                {data.inTransit ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-lg shadow-sm bg-white w-44">
              <div className="text-sm text-gray-500">Delivered</div>
              <div className="mt-2 text-xl font-semibold text-gray-800">
                {data.delivered ?? 0}
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
