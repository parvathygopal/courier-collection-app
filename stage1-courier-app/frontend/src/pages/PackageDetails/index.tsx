import { useParams } from "react-router-dom";
import { usePackage } from "../../hooks/usePackages";
import { usePackageHistory } from "../../hooks/usePackageHistory";

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
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  data.currentStatus === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : data.currentStatus === "IN_TRANSIT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.currentStatus}
              </span>
            </div>
          </div>

          {data.sale && (
            <div>
              <div className="text-sm text-gray-500">Sale Amount</div>
              <div className="mt-1 text-lg font-medium text-gray-800">
                ₹{data.sale.amount.toFixed(2)}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">History</h2>
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
              <div className="text-sm font-medium">{item.status}</div>
              <div className="text-xs text-gray-500">{item.location}</div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



