// Coordinates for major Indian stadiums
export const STADIUMS = {
  chinnaswamy: { name: 'M. Chinnaswamy Stadium', lat: 12.9788, lng: 77.5996, match: 'Royal Challengers Bengaluru vs Chennai Super Kings' },
  narendra: { name: 'Narendra Modi Stadium', lat: 23.0917, lng: 72.5975, match: 'Gujarat Titans vs Mumbai Indians' },
  eden: { name: 'Eden Gardens', lat: 22.5646, lng: 88.3433, match: 'Kolkata Knight Riders vs Sunrisers Hyderabad' },
  wankhede: { name: 'Wankhede Stadium', lat: 18.9389, lng: 72.8258, match: 'Mumbai Indians vs Delhi Capitals' }
};

const ZONE_OFFSETS = {
  'North Stand': { latO: 0.0006, lngO: 0 },
  'South Pavilion': { latO: -0.0006, lngO: 0 },
  'Pavilion End': { latO: -0.0004, lngO: -0.0005 },
  'VIP Enclosure': { latO: 0, lngO: -0.0006 },
  'East Gate': { latO: 0, lngO: 0.0008 },
  'West Gate': { latO: 0, lngO: -0.0008 },
  'Food Court A': { latO: 0.0005, lngO: 0.0006 },
  'Restroom Block 1': { latO: -0.0005, lngO: 0.0006 }
};

// Map exact logical zones to physical offsets
export function mapZonesToCoordinates(stadiumData, centerLat, centerLng) {
  if (!stadiumData) return [];
  
  const zones = Object.keys(stadiumData);
  
  return zones.map((zoneName) => {
    const offset = ZONE_OFFSETS[zoneName] || { latO: 0, lngO: 0 };
    return {
      name: zoneName,
      location: {
         lat: centerLat + offset.latO,
         lng: centerLng + offset.lngO
      },
      data: stadiumData[zoneName]
    };
  });
}
