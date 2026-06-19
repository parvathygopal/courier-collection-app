export type PackageStatus =
  | "TO_BE_PICKED_UP"
  | "PICKED_UP"
  | "ADDED_TO_BAG"
  | "EN_ROUTE"
  | "ARRIVED"
  | "SCHEDULED_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY";

export interface Region {
  id: string;
  code: string;
  name: string;
  createdAt: string;
}

export interface BagSummary {
  id: string;
  bagCode: string;
  createdAt: string;
  truckId: string | null;
}

export interface Package {
  id: string;
  trackingId: string;
  currentStatus: PackageStatus;
  createdAt: string;
  bagId: string | null;
  bag: BagSummary | null;
  sourceRegionId: string;
  sourceRegion: Region;
  destinationRegionId: string;
  destinationRegion: Region;
}

export interface TrackingHistory {
  id: string;
  packageId: string;
  status: PackageStatus;
  createdAt: string;
}

export interface DashboardData {
  totalPackages: number;
  totalBags: number;
  totalTrucks: number;
  inBagPackages: number;
  created: number;
  inTransit: number;
  delivered: number;
  sections: {
    waitingToBeBagged: {
      morningToNoon: Package[];
      noonToEvening: Package[];
    };
    fromLastTruckArrivalYetToBeBagged: Package[];
    baggedLoadedToTrucks: Package[];
    delayedPackages: Package[];
  };
}

export interface ApiResponse<T> {
  error: {
    code: string;
    message: string;
  } | null;
  message: string;
  data: T | null;
}
