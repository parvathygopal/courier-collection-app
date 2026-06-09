export type PackageStatus =
  | "CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED";

export interface Package {
  id: string;
  trackingId: string;
  senderAddress: string;
  receiverAddress: string;
  sourceRegion: string;
  destinationRegion: string;
  weight: number;
  currentStatus: PackageStatus;
  currentLocation: string;
  createdAt: string;
}
