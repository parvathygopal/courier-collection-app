export function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function statusClass(status: string) {
  switch (status) {
    case "OUT_FOR_DELIVERY":
      return "bg-green-100 text-green-800";
    case "EN_ROUTE":
      return "bg-yellow-100 text-yellow-800";
    case "ARRIVED":
      return "bg-cyan-100 text-cyan-800";
    case "SCHEDULED_FOR_DELIVERY":
      return "bg-purple-100 text-purple-800";
    case "ADDED_TO_BAG":
      return "bg-indigo-100 text-indigo-800";
    case "PICKED_UP":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export const STATUS_TRANSITIONS: Record<string, string | null> = {
  TO_BE_PICKED_UP: "PICKED_UP",
  PICKED_UP: "ADDED_TO_BAG",
  ADDED_TO_BAG: "EN_ROUTE",
  EN_ROUTE: "ARRIVED",
  ARRIVED: "SCHEDULED_FOR_DELIVERY",
  SCHEDULED_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: null,
};
