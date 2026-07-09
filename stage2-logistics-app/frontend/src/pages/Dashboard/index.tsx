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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
          {packages.length}
        </span>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-500">
          No packages available.
        </div>
      ) : (
        <div className="space-y-3">
          {packages.slice(0, 10).map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">
                    {pkg.trackingId}
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    {pkg.sourceRegion.code} → {pkg.destinationRegion.code}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      pkg.currentStatus
                    )}`}
                  >
                    {formatStatus(pkg.currentStatus)}
                  </span>

                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(pkg.createdAt).toLocaleString()}
                  </div>
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
    <main className="max-w-7xl mx-auto p-6">
  
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Logistics Dashboard
        </h1>
  
        <p className="mt-2 text-gray-500">
          Monitor package movement across the logistics network.
        </p>
      </div>
  
      {isLoading || !data ? (
        <div className="rounded-xl bg-white shadow-sm p-12 text-center text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-8">
  
            <div className="rounded-xl bg-white shadow-sm border p-5">
              <div className="text-sm text-gray-500">Total Packages</div>
              <div className="mt-3 text-3xl font-bold text-indigo-600">
                {data.totalPackages}
              </div>
            </div>
  
            <div className="rounded-xl bg-white shadow-sm border p-5">
              <div className="text-sm text-gray-500">Created</div>
              <div className="mt-3 text-3xl font-bold text-blue-600">
                {data.created}
              </div>
            </div>
  
            <div className="rounded-xl bg-white shadow-sm border p-5">
              <div className="text-sm text-gray-500">In Transit</div>
              <div className="mt-3 text-3xl font-bold text-amber-600">
                {data.inTransit}
              </div>
            </div>
  
            <div className="rounded-xl bg-white shadow-sm border p-5">
              <div className="text-sm text-gray-500">Out For Delivery</div>
              <div className="mt-3 text-3xl font-bold text-green-600">
                {data.delivered}
              </div>
            </div>
  
          </div>
  
          <div className="grid gap-6 lg:grid-cols-2">
  
            <SectionCard
              title="Yet to be bagged (Morning to Noon)"
              packages={data.sections.waitingToBeBagged.morningToNoon}
            />
  
            <SectionCard
              title="Yet to be bagged (Noon to Evening)"
              packages={data.sections.waitingToBeBagged.noonToEvening}
            />
  
            <SectionCard
              title="Last Truck Arrival"
              packages={data.sections.fromLastTruckArrivalYetToBeBagged}
            />
  
            <SectionCard
              title="Bagged & Loaded"
              packages={data.sections.baggedLoadedToTrucks}
            />
  
          </div>
  
          <div className="mt-6">
            <SectionCard
              title="Delayed Packages"
              packages={data.sections.delayedPackages}
            />
          </div>
        </>
      )}
  
    </main>
  );
}
