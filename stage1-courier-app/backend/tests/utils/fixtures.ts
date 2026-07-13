import { randomUUID } from "crypto";

export function createMockPackageData() {
  return {
    senderAddress: "123 Sender St",
    receiverAddress: "456 Receiver Ave",
    sourceRegion: "REGION_A",
    destinationRegion: "REGION_B",
    weight: 2.5,
    currentLocation: "Warehouse A",
    saleAmount: 999.99,
  };
}

export function createMockWebhookPayload(trackingId?: string) {
  return {
    trackingId: trackingId || randomUUID(),
    senderAddress: "123 Sender St",
    receiverAddress: "456 Receiver Ave",
    sourceRegionCode: "REGION_A",
    destinationRegionCode: "REGION_B",
    weight: 2.5,
  };
}

export function createMockRawUpdate(trackingId?: string) {
  return {
    trackingId: trackingId || randomUUID(),
    status: "IN_TRANSIT",
    location: "Hub B",
    timestamp: new Date(),
    sourceStatus: "LOADED_TO_TRUCK",
    processed: false,
  };
}
