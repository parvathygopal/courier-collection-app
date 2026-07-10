export interface Sale {
  id: string;
  packageId: string;
  amount: number;
}

export interface Package {
  id: string;
  trackingId: string;
  senderAddress: string;
  receiverAddress: string;
  sourceRegion: string;
  destinationRegion: string;
  weight: number;
  currentStatus: string;
  currentLocation: string;
  createdAt: string;
  sale?: Sale | null;
}

export interface TrackingHistory {
  id: string;
  status: string;
  location: string;
  timestamp: string;
}

export interface DashboardData {
  totalPackages: number;
  created: number;
  inTransit: number;
  delivered: number;
  sections: {
    waitingPickup: Array<{
      id: string;
      trackingId: string;
      sourceRegion: string;
      destinationRegion: string;
      currentStatus: string;
      currentLocation: string;
      createdAt: string;
    }>;
    inTransit: Array<{
      id: string;
      trackingId: string;
      sourceRegion: string;
      destinationRegion: string;
      currentStatus: string;
      currentLocation: string;
      createdAt: string;
    }>;
    delayed: Array<{
      id: string;
      trackingId: string;
      sourceRegion: string;
      destinationRegion: string;
      currentStatus: string;
      currentLocation: string;
      createdAt: string;
    }>;
  };
}

export interface ApiResponse<T> {
  error: string | null;
  message: string;
  data: T | null;
}
