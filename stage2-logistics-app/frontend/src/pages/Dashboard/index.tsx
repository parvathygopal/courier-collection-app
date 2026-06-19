import { useDashboard } from "../../hooks/useDashboard";
import { formatStatus, statusClass } from "../../lib/package-status";
import type { Package } from "../../types/package.types";

function SectionCard({
  title,
  packages,
}: {
  title: string;
  packages: Package[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {packages.length}
        </span>
      </div>

      {packages.length === 0 ? (
        <div className="text-sm text-gray-500">
          No packages in this section.
        </div>
      ) : (
        <div className="space-y-2">
          {packages.slice(0, 10).map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between rounded-md border border-gray-100 p-2"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {pkg.trackingId}
                </div>
                <div className="text-xs text-gray-500">
                  {pkg.sourceRegion.code} → {pkg.destinationRegion.code}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusClass(
                    pkg.currentStatus,
                  )}`}
                >
                  {formatStatus(pkg.currentStatus)}
                </span>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(pkg.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <div className="space-y-6">
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
                <div className="text-sm text-gray-500">Out For Delivery</div>
                <div className="mt-2 text-xl font-semibold text-gray-800">
                  {data.delivered ?? 0}
                </div>
              </div>
            </nav>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard
                title="Yet to be bagged (Morning to Noon)"
                packages={data.sections.waitingToBeBagged.morningToNoon}
              />
              <SectionCard
                title="Yet to be bagged (Noon to Evening)"
                packages={data.sections.waitingToBeBagged.noonToEvening}
              />
              <SectionCard
                title="Last truck arrival: yet to be bagged"
                packages={data.sections.fromLastTruckArrivalYetToBeBagged}
              />
              <SectionCard
                title="Bagged and loaded on trucks"
                packages={data.sections.baggedLoadedToTrucks}
              />
            </div>

            <SectionCard
              title="Delayed packages"
              packages={data.sections.delayedPackages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
