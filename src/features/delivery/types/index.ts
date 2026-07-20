export interface Coordinate {
  longitude: string;
  latitude: string;
}

export interface DeliverLocationResponse {
  type: "success" | "error" | string;
  message: string;
  driverlocation: Coordinate;
  customerlocation: Coordinate;
}
