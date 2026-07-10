import { useState } from "react";
import { publicTrackingService } from "../../services/public-tracking.service";

interface PublicPackageData {
  trackingId: string;
  currentStatus: string;
  currentLocation: string;
  destinationRegion: string;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}

export default function PublicTracking() {
  const [trackingId, setTrackingId] = useState("");
  const [captchaToken, setCaptchaToken] = useState(() => {
    return crypto.getRandomValues(new Uint8Array(16)).join("");
  });
  const [data, setData] = useState<PublicPackageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const generateNewToken = () => {
    const newToken = crypto.getRandomValues(new Uint8Array(16)).join("");
    setCaptchaToken(newToken);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setData(null);
    setSearched(true);
    setLoading(true);

    try {
      if (!trackingId.trim()) {
        setError("Please enter a tracking ID");
        setLoading(false);
        return;
      }

      const result = await publicTrackingService.getPublicPackage(
        trackingId.trim(),
        captchaToken
      );

      if (!result) {
        setError("Package not found");
      } else {
        setData(result);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 404) {
        setError("Package not found");
      } else if (err?.response?.status === 401) {
        setError("Captcha verification failed. Please try again.");
        generateNewToken();
      } else {
        setError(err?.response?.data?.message ?? "Failed to fetch package");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "IN_TRANSIT":
      case "OUT_FOR_DELIVERY":
        return "bg-yellow-100 text-yellow-800";
      case "CREATED":
      case "PICKED_UP":
      case "ADDED_TO_BAG":
      case "EN_ROUTE":
      case "ARRIVED_AT_REGION":
      case "SCHEDULED_FOR_DELIVERY":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Track Your Package
          </h1>
          <p className="text-lg text-gray-600">
            Enter your tracking ID to check the status of your shipment
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label
                htmlFor="trackingId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tracking ID
              </label>
              <input
                id="trackingId"
                type="text"
                placeholder="Enter your tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Captcha Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-800">
                      ✓
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">
                    Verification required to prevent abuse
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateNewToken}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Refresh
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? "Searching..." : "Search Package"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Card */}
        {searched && data && (
          <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
            {/* Package Header */}
            <div className="border-b border-gray-200 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {data.trackingId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Destination</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.destinationRegion}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <p className="text-sm text-gray-500 mb-3">Current Status</p>
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                      data.currentStatus
                    )}`}
                  >
                    {data.currentStatus}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-base font-medium text-gray-900">
                    {data.currentLocation || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tracking History
              </h2>
              <div className="space-y-4">
                {data.statusHistory.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < data.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-blue-200"></div>
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900">{item.status}</p>
                      {item.location && (
                        <p className="text-sm text-gray-600">{item.location}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Created Date */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Created On</p>
              <p className="text-base font-medium text-gray-900">
                {new Date(data.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searched && !data && !error && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500">Package not found</p>
          </div>
        )}
      </div>
    </main>
  );
}
