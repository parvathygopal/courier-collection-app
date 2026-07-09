import { Link } from "react-router-dom";
import { usePackages } from "../../hooks/usePackages";

export default function PackageList() {
  const { data = [], isLoading } = usePackages();

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="rounded-xl bg-white shadow-sm border p-10 text-center text-gray-500">
          Loading packages...
        </div>
      </main>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "IN_TRANSIT":
      case "EN_ROUTE":
        return "bg-amber-100 text-amber-700";

      case "OUT_FOR_DELIVERY":
        return "bg-blue-100 text-blue-700";

      case "CREATED":
      case "TO_BE_PICKED_UP":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Packages
          </h1>

          <p className="mt-2 text-gray-500">
            View and track all courier packages.
          </p>
        </div>

        <Link
          to="/packages/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Create Package
        </Link>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">

          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Tracking ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Source
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                Destination
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-gray-500"
                >
                  📦 No packages found.
                </td>
              </tr>
            ) : (
              data.map((pkg: any) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`/packages/${pkg.trackingId}`}
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {pkg.trackingId}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        pkg.currentStatus
                      )}`}
                    >
                      {pkg.currentStatus.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {pkg.sourceRegion}
                  </td>

                  <td className="px-6 py-4 text-gray-700">
                    {pkg.destinationRegion}
                  </td>
                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>
    </main>
  );
}