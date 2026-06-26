import { Link, useNavigate } from "react-router-dom";
import { usePackages } from "../../hooks/usePackages";
import { formatStatus, statusClass } from "../../lib/package-status";

export default function PackageList() {
  const navigate = useNavigate();
  const { data: packages = [], isLoading } = usePackages();
  if (isLoading) {
    return (
      <div className="container">
        <div className="card loader">Loading packages…</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Packages</h1>
        <div>
          <button
            onClick={() => navigate("/create-package")}
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded"
          >
            Create Package
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Tracking ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Bag Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Destination
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {packages && packages.length > 0 ? (
                packages.map((pkg: any) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <Link
                        to={`/packages/${pkg.trackingId}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {pkg.trackingId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusClass(
                          pkg.currentStatus,
                        )}`}
                      >
                        {formatStatus(pkg.currentStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pkg.bag?.bagCode || "Not assigned"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pkg.sourceRegion.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pkg.destinationRegion.name}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No packages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
