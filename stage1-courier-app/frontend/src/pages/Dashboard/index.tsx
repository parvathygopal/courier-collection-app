import { useDashboard } from "../../hooks/useDashboard";
import { formatStatus, statusClass } from "../../lib/package-status";

interface SectionCardProps {
  title: string;
  packages: Array<{
    id: string;
    trackingId: string;
    sourceRegion: string;
    destinationRegion: string;
    currentStatus: string;
    currentLocation: string;
    createdAt: string;
  }>;
}

function SectionCard({ title, packages }: SectionCardProps) {
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
                    {pkg.sourceRegion} → {pkg.destinationRegion}
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
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
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

      {/* Operational Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Waiting for Pickup"
          packages={data.sections.waitingPickup}
        />

        <SectionCard
          title="In Transit"
          packages={data.sections.inTransit}
        />

        <div className="lg:col-span-2">
          <SectionCard
            title="Delayed Packages"
            packages={data.sections.delayed}
          />
        </div>
      </div>
    </main>
  );
}