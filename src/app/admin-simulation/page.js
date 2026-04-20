'use client';

import React, { useEffect, useState } from 'react';
import { ref, set } from 'firebase/database';
import { db, hasValidConfig } from '../../lib/firebase';
import { generateSimulationData } from '../../lib/simulationUtils';

export default function AdminSimulationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    if (!hasValidConfig || !db) {
      console.warn("No valid Firebase config detected. Simulation running strictly client-side fallback log.");
    }
    
    setIsRunning(true);
    let state = generateSimulationData();
    setLocalData(state);

    const interval = setInterval(() => {
      // Fluctuate the state
      const nextState = JSON.parse(JSON.stringify(state));
      Object.keys(nextState.zones).forEach(zone => {
        const currentDensity = nextState.zones[zone].densityScore;
        const delta = Math.floor(Math.random() * 31) - 15; // +/- 15
        let newDensity = currentDensity + delta;
        
        if (newDensity < 0) newDensity = 0;
        if (newDensity > 100) newDensity = 100;

        nextState.zones[zone].densityScore = newDensity;

        if (nextState.queues[zone] !== undefined) {
           const currentWait = nextState.queues[zone].waitTime;
           const waitDelta = Math.floor(Math.random() * 7) - 3;
           let newWait = currentWait + waitDelta;
           const minWait = Math.floor((newDensity / 100) * 10);
           if (newWait < minWait) newWait = minWait;
           if (newWait > 60) newWait = 60; 
           nextState.queues[zone].waitTime = newWait;
        }
      });

      state = nextState;
      setLocalData(state);

      // Push to Firebase RTDB
      if (hasValidConfig && db) {
        set(ref(db, 'stadium'), state).catch(err => console.error("Firebase Write Error:", err));
      }

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>⚙️ Hidden Admin Route</h1>
      <p>This route isolates the simulation loop to prevent race conditions from multiple viewers.</p>
      
      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
        <h3>Simulation Status: <span style={{ color: '#059669' }}>{isRunning ? 'RUNNING' : 'STOPPED'}</span></h3>
        <p>Target: {hasValidConfig ? 'Firebase RTDB' : 'Mock Client Logging'}</p>
        
        <pre style={{ background: '#0f172a', color: '#34d399', padding: '1rem', borderRadius: '6px', maxHeight: '400px', overflow: 'auto' }}>
          {JSON.stringify(localData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
