import { useParams } from "react-router-dom";
import { usePackage } from "../../hooks/usePackages";
import { usePackageHistory } from "../../hooks/usePackageHistory";
import { useUpdateStatus } from "../../hooks/useUpdateStatus";
import {
  formatStatus,
  STATUS_TRANSITIONS,
  statusClass,
} from "../../lib/package-status";
export default function PackageDetails() {
  const { trackingId } = useParams();

  const { data, isLoading } = usePackage(trackingId!);

  if (isLoading) {
    return (
      <div className="container">
        <div className="card loader">Loading package details…</div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="container">
        <div className="card text-center text-gray-500">Package not found.</div>
      </div>
    );

  return (
    <div className="container">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Package Details</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Tracking ID</div>
            <div className="mt-1 text-lg font-medium text-gray-800">
              {data.trackingId}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusClass(
                  data.currentStatus,
                )}`}
              >
                {formatStatus(data.currentStatus)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">History</h2>
            <StatusUpdater trackingId={data.trackingId} />
          </div>

          <PackageHistory trackingId={data.trackingId} />
        </div>
      </div>
    </div>
  );
}

function PackageHistory({ trackingId }: { trackingId: string }) {
  const { data, isLoading } = usePackageHistory(trackingId);

  if (isLoading) return <div className="mt-4 loader">Loading history…</div>;

  if (!data || data.length === 0)
    return <div className="text-gray-500 mt-2">No history available.</div>;

  return (
    <div className="timeline mt-2">
      {data.map((item) => (
        <div className="timeline-item" key={item.id}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {formatStatus(item.status)}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusUpdater({ trackingId }: { trackingId: string }) {
  const { data: pkg } = usePackage(trackingId);
  const mutation = useUpdateStatus(trackingId);
  const loading = mutation.status === "pending";

  const nextStatus = pkg ? STATUS_TRANSITIONS[pkg.currentStatus] : null;

  return (
    <div>
      <button
        onClick={() => mutation.mutate()}
        disabled={loading || !nextStatus}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading
          ? "Updating…"
          : nextStatus
            ? `Mark as ${formatStatus(nextStatus)}`
            : "Already delivered"}
      </button>
      {mutation.isError && (
        <div className="text-red-600 text-sm mt-2">
          Failed to update status.
        </div>
      )}
    </div>
  );
}
