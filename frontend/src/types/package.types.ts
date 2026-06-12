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
}

export interface TrackingHistory {
  id: string;
  status: string;
  location: string;
  timestamp: string;
}

export interface DashboardData {
  total: number;
  created: number;
  inTransit: number;
  delivered: number;
}

export interface ApiResponse<T> {
  error: string | null;
  message: string;
  data: T | null;
}
