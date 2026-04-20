import { generateSimulationData, getLeastCrowded } from '../src/lib/simulationUtils';

describe('Simulation Data Generation', () => {
  it('should generate valid simulation output format', () => {
    const data = generateSimulationData();
    
    // Check main structure
    expect(data).toHaveProperty('zones');
    expect(data).toHaveProperty('queues');

    // Expected zones
    const expectedZones = ['Gate A', 'Gate B', 'Food Stall 1', 'Restroom North', 'Seating Zone 1'];
    
    expectedZones.forEach(zone => {
      expect(data.zones).toHaveProperty(zone);
      expect(data.zones[zone]).toHaveProperty('level');
      expect(['low', 'medium', 'high']).toContain(data.zones[zone].level);
      expect(data.zones[zone]).toHaveProperty('densityScore');
    });

    // Seating zones should not have queues
    expect(data.queues).not.toHaveProperty('Seating Zone 1');
    expect(data.queues).not.toHaveProperty('Seating Zone 2');

    // Other zones should have queues
    expect(data.queues).toHaveProperty('Gate A');
    expect(data.queues['Gate A']).toHaveProperty('waitTime');
    expect(typeof data.queues['Gate A'].waitTime).toBe('number');
  });
});

describe('Recommendation Logic', () => {
  it('should identify the least crowded facility', () => {
    const mockQueues = {
      'Gate A': { waitTime: 15 },
      'Gate B': { waitTime: 5 },
      'Gate C': { waitTime: 25 },
      'Food Stall 1': { waitTime: 10 },
      'Food Stall 2': { waitTime: 12 },
    };

    const bestGate = getLeastCrowded(mockQueues, 'Gate');
    const bestFood = getLeastCrowded(mockQueues, 'Food');
    
    expect(bestGate).toEqual({ name: 'Gate B', waitTime: 5 });
    expect(bestFood).toEqual({ name: 'Food Stall 1', waitTime: 10 });
  });

  it('should return null if no matching prefix is found', () => {
    const mockQueues = {
      'Gate A': { waitTime: 15 },
    };

    const bestRestroom = getLeastCrowded(mockQueues, 'Restroom');
    expect(bestRestroom).toBeNull();
  });
});
