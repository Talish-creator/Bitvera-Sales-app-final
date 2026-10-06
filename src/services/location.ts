/**
 * Bitvera Sales — Real Geolocation & Geofencing Engine
 * 
 * Uses hardware GPS via navigator.geolocation / native platform APIs.
 * Calculates geodesic distance using the Haversine formula.
 * Strictly eliminates random/simulated coordinates in production.
 */

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
}

export interface GeofenceResult {
  isWithinGeofence: boolean;
  distanceMeters: number;
  distanceKm: number;
  geofenceRadiusMeters: number;
  accuracyMeters: number;
  accuracyAcceptable: boolean;
  error?: string;
}

const EARTH_RADIUS_KM = 6371;
const MAX_ACCEPTABLE_ACCURACY_METERS = 250; // Reject positions with drift > 250m

/**
 * Calculate geodesic distance between two latitude/longitude points in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 1000) / 1000; // 3 decimal places (meters precision)
}

/**
 * Acquire genuine current device GPS coordinates
 */
export async function getCurrentDeviceLocation(
  timeoutMs: number = 10000
): Promise<{ success: boolean; coords?: GpsCoordinates; error?: string }> {
  if (!navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation hardware or API is not supported by this device/browser.'
    };
  }

  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords: GpsCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp
        };
        resolve({ success: true, coords });
      },
      error => {
        let errorMsg = 'Failed to acquire device location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission denied by user. Please grant location access in device settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'GPS signal unavailable. Please ensure location services are enabled.';
            break;
          case error.TIMEOUT:
            errorMsg = 'GPS acquisition timed out. Please try again with clear sky view.';
            break;
        }
        resolve({ success: false, error: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 5000
      }
    );
  });
}

/**
 * Verify whether device is inside the customer's geofence radius
 */
export function verifyCustomerGeofence(
  currentCoords: GpsCoordinates,
  customerLat: number,
  customerLng: number,
  geofenceRadiusMeters: number = 200
): GeofenceResult {
  const distanceKm = calculateHaversineDistanceKm(
    currentCoords.latitude,
    currentCoords.longitude,
    customerLat,
    customerLng
  );

  const distanceMeters = Math.round(distanceKm * 1000);
  const accuracyAcceptable = currentCoords.accuracy <= MAX_ACCEPTABLE_ACCURACY_METERS;
  const isWithinGeofence = distanceMeters <= geofenceRadiusMeters;

  return {
    isWithinGeofence,
    distanceMeters,
    distanceKm,
    geofenceRadiusMeters,
    accuracyMeters: currentCoords.accuracy,
    accuracyAcceptable,
    error: !accuracyAcceptable
      ? `GPS accuracy too low (${currentCoords.accuracy}m). Move to an open area.`
      : undefined
  };
}
