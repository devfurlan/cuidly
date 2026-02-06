/**
 * Geographic distance calculation utilities using Haversine formula
 */

/**
 * Represents geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Represents an address with optional coordinates
 */
export interface AddressWithCoordinates {
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two geographic points using the Haversine formula.
 *
 * The Haversine formula determines the great-circle distance between two points
 * on a sphere given their longitudes and latitudes. This is particularly useful
 * for calculating distances on Earth's surface.
 *
 * Formula:
 * a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
 * c = 2 × atan2(√a, √(1−a))
 * d = R × c
 *
 * @param point1 - First geographic coordinate (latitude, longitude)
 * @param point2 - Second geographic coordinate (latitude, longitude)
 * @returns Distance in kilometers between the two points
 *
 * @example
 * ```ts
 * const distance = calculateDistance(
 *   { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
 *   { latitude: -22.9068, longitude: -43.1729 }  // Rio de Janeiro
 * );
 * // Returns approximately 357 km
 * ```
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const lat1Rad = degreesToRadians(point1.latitude);
  const lat2Rad = degreesToRadians(point2.latitude);
  const deltaLatRad = degreesToRadians(point2.latitude - point1.latitude);
  const deltaLonRad = degreesToRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLonRad / 2) *
      Math.sin(deltaLonRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculates distance between two addresses if both have valid coordinates.
 * Returns null if either address lacks coordinates.
 *
 * @param address1 - First address with optional coordinates
 * @param address2 - Second address with optional coordinates
 * @returns Distance in kilometers or null if coordinates are missing
 *
 * @example
 * ```ts
 * const distance = calculateDistanceBetweenAddresses(
 *   { latitude: -23.5505, longitude: -46.6333 },
 *   { latitude: -23.5489, longitude: -46.6388 }
 * );
 * // Returns distance in km or null
 * ```
 */
export function calculateDistanceBetweenAddresses(
  address1: AddressWithCoordinates,
  address2: AddressWithCoordinates
): number | null {
  if (
    address1.latitude == null ||
    address1.longitude == null ||
    address2.latitude == null ||
    address2.longitude == null
  ) {
    return null;
  }

  return calculateDistance(
    { latitude: address1.latitude, longitude: address1.longitude },
    { latitude: address2.latitude, longitude: address2.longitude }
  );
}

/**
 * Checks if a point is within a given radius of another point.
 *
 * @param center - Center point coordinates
 * @param target - Target point to check
 * @param radiusKm - Maximum distance in kilometers
 * @returns True if target is within radius of center
 *
 * @example
 * ```ts
 * const isNearby = isWithinRadius(
 *   { latitude: -23.5505, longitude: -46.6333 },
 *   { latitude: -23.5489, longitude: -46.6388 },
 *   5 // 5 km radius
 * );
 * ```
 */
export function isWithinRadius(
  center: Coordinates,
  target: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(center, target);
  return distance <= radiusKm;
}

/**
 * Filters an array of items with coordinates to only those within a radius.
 *
 * @param center - Center point coordinates
 * @param items - Array of items with coordinates
 * @param radiusKm - Maximum distance in kilometers
 * @param getCoordinates - Function to extract coordinates from an item
 * @returns Array of items within the specified radius
 *
 * @example
 * ```ts
 * const nearbyNannies = filterByRadius(
 *   familyLocation,
 *   nannies,
 *   10,
 *   (nanny) => nanny.address
 * );
 * ```
 */
export function filterByRadius<T>(
  center: Coordinates,
  items: T[],
  radiusKm: number,
  getCoordinates: (item: T) => Coordinates | null
): T[] {
  return items.filter((item) => {
    const coords = getCoordinates(item);
    if (!coords) return false;
    return isWithinRadius(center, coords, radiusKm);
  });
}

/**
 * Sorts items by distance from a center point (nearest first).
 *
 * @param center - Center point coordinates
 * @param items - Array of items with coordinates
 * @param getCoordinates - Function to extract coordinates from an item
 * @returns Array sorted by distance (nearest first), items without coordinates at the end
 *
 * @example
 * ```ts
 * const sortedNannies = sortByDistance(
 *   familyLocation,
 *   nannies,
 *   (nanny) => nanny.address
 * );
 * ```
 */
export function sortByDistance<T>(
  center: Coordinates,
  items: T[],
  getCoordinates: (item: T) => Coordinates | null
): T[] {
  return [...items].sort((a, b) => {
    const coordsA = getCoordinates(a);
    const coordsB = getCoordinates(b);

    // Items without coordinates go to the end
    if (!coordsA && !coordsB) return 0;
    if (!coordsA) return 1;
    if (!coordsB) return -1;

    const distanceA = calculateDistance(center, coordsA);
    const distanceB = calculateDistance(center, coordsB);

    return distanceA - distanceB;
  });
}

/**
 * Calculates distances for all items and returns them with distance info.
 *
 * @param center - Center point coordinates
 * @param items - Array of items with coordinates
 * @param getCoordinates - Function to extract coordinates from an item
 * @returns Array of items with their distances
 *
 * @example
 * ```ts
 * const nanniesWithDistance = addDistanceToItems(
 *   familyLocation,
 *   nannies,
 *   (nanny) => nanny.address
 * );
 * // Each item will have a `distance` property in km
 * ```
 */
export function addDistanceToItems<T>(
  center: Coordinates,
  items: T[],
  getCoordinates: (item: T) => Coordinates | null
): Array<T & { distance: number | null }> {
  return items.map((item) => {
    const coords = getCoordinates(item);
    const distance = coords ? calculateDistance(center, coords) : null;
    return { ...item, distance };
  });
}

/**
 * Converts MaxTravelDistance enum to kilometers.
 * Must match the MaxTravelDistance enum in Prisma schema.
 *
 * @param maxTravelDistance - The MaxTravelDistance enum value
 * @returns Distance in kilometers
 */
export function maxTravelDistanceToKm(
  maxTravelDistance: string | null | undefined
): number {
  const distanceMap: Record<string, number> = {
    UP_TO_5KM: 5,
    UP_TO_10KM: 10,
    UP_TO_15KM: 15,
    UP_TO_20KM: 20,
    UP_TO_30KM: 30,
    ENTIRE_CITY: 50, // Assume ~50km for entire city
  };

  return distanceMap[maxTravelDistance || ''] || 10; // Default to 10km
}

/**
 * Checks if a nanny can travel to a family's location based on their max travel distance.
 *
 * @param nannyLocation - Nanny's coordinates
 * @param familyLocation - Family's coordinates
 * @param maxTravelDistance - Nanny's maximum travel distance enum
 * @returns True if family is within nanny's travel range
 */
export function isWithinNannyTravelRange(
  nannyLocation: Coordinates,
  familyLocation: Coordinates,
  maxTravelDistance: string | null | undefined
): boolean {
  const radiusKm = maxTravelDistanceToKm(maxTravelDistance);
  return isWithinRadius(nannyLocation, familyLocation, radiusKm);
}
