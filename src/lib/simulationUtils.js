export const ZONES = [
  'Pavilion End', 'North Stand', 
  'South Pavilion', 'VIP Enclosure', 
  'East Gate', 'West Gate', 
  'Food Court A', 'Restroom Block 1'
];

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSimulationData() {
  const data = {
    zones: {},
    queues: {}
  };

  ZONES.forEach(zone => {
    // Generate crowd density: low (0-33%), medium (34-66%), high (67-100%)
    const crowdDensity = getRandomInt(0, 100);
    let crowdLevel = 'low';
    if (crowdDensity > 33 && crowdDensity <= 66) crowdLevel = 'medium';
    if (crowdDensity > 66) crowdLevel = 'high';

    const isSeating = zone.includes('Stand') || zone.includes('Pavilion') || zone.includes('Enclosure');
    // higher crowd density usually means higher wait time (0 to 30 mins)
    const waitTime = Math.floor((crowdDensity / 100) * 30) + getRandomInt(0, 5); 

    data.zones[zone] = {
      level: crowdLevel,
      densityScore: crowdDensity
    };

    data.queues[zone] = {
      waitTime: waitTime
    };
  });

  return data;
}

export const getLeastCrowded = (queues, keyword) => {
  if (!queues) return null;
  const prefixedQueues = Object.entries(queues)
    .filter(([name]) => name.includes(keyword))
    .map(([name, data]) => ({ name, waitTime: data.waitTime }));

  if (prefixedQueues.length === 0) return null;

  return prefixedQueues.reduce((prev, current) => 
    (prev.waitTime < current.waitTime) ? prev : current
  );
};
