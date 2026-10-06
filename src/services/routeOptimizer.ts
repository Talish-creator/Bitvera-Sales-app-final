/**
 * Bitvera Sales — Route Optimization Engine
 * 
 * Computes shortest-distance visit itineraries across multiple customer stops
 * using geodesic Haversine distance calculations and Nearest-Neighbor TSP heuristic.
 */

import { Customer, Visit } from '../types';
import { calculateHaversineDistanceKm } from './location';

export interface RouteStop {
  stopNumber: number;
  customer: Customer;
  distanceFromPreviousKm: number;
  estimatedTravelMinutes: number;
  visitStatus: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
}

export interface OptimizedRoutePlan {
  stops: RouteStop[];
  totalDistanceKm: number;
  totalEstimatedDriveMinutes: number;
  totalEstimatedServiceMinutes: number;
  totalDurationMinutes: number;
  startingLocation: { lat: number; lng: number; label: string };
}

const AVERAGE_CITY_SPEED_KMH = 35; // Standard urban traffic speed in KSA
const AVERAGE_SERVICE_MINUTES_PER_STOP = 20; // Average on-site visit duration

/**
 * Optimizes the sequence of customer stops using the Nearest-Neighbor heuristic.
 */
export function optimizeCustomerRoute(
  stopsToVisit: { customer: Customer; status: Visit['status'] }[],
  startCoords?: { lat: number; lng: number }
): OptimizedRoutePlan {
  if (stopsToVisit.length === 0) {
    return {
      stops: [],
      totalDistanceKm: 0,
      totalEstimatedDriveMinutes: 0,
      totalEstimatedServiceMinutes: 0,
      totalDurationMinutes: 0,
      startingLocation: { lat: 24.7136, lng: 46.6753, label: 'Riyadh Central Hub' }
    };
  }

  // Current or default start location (Bitvera Central Warehouse)
  const currentPos = startCoords || { lat: 24.7136, lng: 46.6753 };
  const remaining = [...stopsToVisit];
  const orderedStops: RouteStop[] = [];

  let lastLat = currentPos.lat;
  let lastLng = currentPos.lng;
  let totalDistanceKm = 0;
  let totalDriveMinutes = 0;

  let stopIndex = 1;
  while (remaining.length > 0) {
    // Find nearest unvisited stop from current position
    let nearestIdx = 0;
    let shortestDist = calculateHaversineDistanceKm(lastLat, lastLng, remaining[0].customer.lat, remaining[0].customer.lng);

    for (let i = 1; i < remaining.length; i++) {
      const dist = calculateHaversineDistanceKm(lastLat, lastLng, remaining[i].customer.lat, remaining[i].customer.lng);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIdx = i;
      }
    }

    const nextStop = remaining.splice(nearestIdx, 1)[0];
    const roundedDist = Math.round(shortestDist * 100) / 100;
    const travelMins = Math.max(2, Math.round((roundedDist / AVERAGE_CITY_SPEED_KMH) * 60));

    totalDistanceKm += roundedDist;
    totalDriveMinutes += travelMins;

    orderedStops.push({
      stopNumber: stopIndex++,
      customer: nextStop.customer,
      distanceFromPreviousKm: roundedDist,
      estimatedTravelMinutes: travelMins,
      visitStatus: nextStop.status
    });

    lastLat = nextStop.customer.lat;
    lastLng = nextStop.customer.lng;
  }

  const totalServiceMinutes = orderedStops.length * AVERAGE_SERVICE_MINUTES_PER_STOP;
  const totalDurationMinutes = totalDriveMinutes + totalServiceMinutes;

  return {
    stops: orderedStops,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalEstimatedDriveMinutes: totalDriveMinutes,
    totalEstimatedServiceMinutes: totalServiceMinutes,
    totalDurationMinutes,
    startingLocation: {
      lat: currentPos.lat,
      lng: currentPos.lng,
      label: 'Operator Terminal GPS / Dispatch Origin'
    }
  };
}

/**
 * Re-calculate distance and time for a manually reordered list of customer stops.
 */
export function recalculateCustomRoute(
  stops: { customer: Customer; status: Visit['status'] }[],
  startCoords?: { lat: number; lng: number }
): OptimizedRoutePlan {
  const currentPos = startCoords || { lat: 24.7136, lng: 46.6753 };
  const orderedStops: RouteStop[] = [];

  let lastLat = currentPos.lat;
  let lastLng = currentPos.lng;
  let totalDistanceKm = 0;
  let totalDriveMinutes = 0;

  stops.forEach((s, idx) => {
    const dist = calculateHaversineDistanceKm(lastLat, lastLng, s.customer.lat, s.customer.lng);
    const roundedDist = Math.round(dist * 100) / 100;
    const travelMins = Math.max(2, Math.round((roundedDist / AVERAGE_CITY_SPEED_KMH) * 60));

    totalDistanceKm += roundedDist;
    totalDriveMinutes += travelMins;

    orderedStops.push({
      stopNumber: idx + 1,
      customer: s.customer,
      distanceFromPreviousKm: roundedDist,
      estimatedTravelMinutes: travelMins,
      visitStatus: s.status
    });

    lastLat = s.customer.lat;
    lastLng = s.customer.lng;
  });

  const totalServiceMinutes = orderedStops.length * AVERAGE_SERVICE_MINUTES_PER_STOP;

  return {
    stops: orderedStops,
    totalDistanceKm: Math.round(totalDistanceKm * 100) / 100,
    totalEstimatedDriveMinutes: totalDriveMinutes,
    totalEstimatedServiceMinutes: totalServiceMinutes,
    totalDurationMinutes: totalDriveMinutes + totalServiceMinutes,
    startingLocation: {
      lat: currentPos.lat,
      lng: currentPos.lng,
      label: 'Operator Terminal GPS / Dispatch Origin'
    }
  };
}
