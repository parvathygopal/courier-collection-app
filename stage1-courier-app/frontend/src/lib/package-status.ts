export function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function statusClass(status: string) {
  switch (status) {
    case "CREATED":
      return "bg-blue-100 text-blue-800";
    case "PICKED_UP":
      return "bg-indigo-100 text-indigo-800";
    case "IN_TRANSIT":
      return "bg-yellow-100 text-yellow-800";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "RETURNED":
      return "bg-red-100 text-red-800";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
