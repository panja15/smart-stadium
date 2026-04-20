'use client';

import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db, hasValidConfig } from '../lib/firebase';
import StadiumMapGoogle from '../components/StadiumMapGoogle';
import SchematicStadium from '../components/SchematicStadium';
import QueueList from '../components/QueueList';
import SmartAlerts from '../components/SmartAlerts';
import AICommandBar from '../components/AICommandBar';
import { STADIUMS, mapZonesToCoordinates } from '../lib/mapUtils';
import { generateSimulationData, ZONES } from '../lib/simulationUtils';
import styles from './page.module.css';

export default function Home() {
  const [stadiumData, setStadiumData] = useState({ zones: {}, queues: {} });
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedStadium, setSelectedStadium] = useState('chinnaswamy');
  const [activeZone, setActiveZone] = useState(null);
  const [viewMode, setViewMode] = useState('schematic'); // 'map' or 'schematic'
  const [activeActionTarget, setActiveActionTarget] = useState(null);

  // Strictly Read-Only Listener
  useEffect(() => {
    // Graceful Fallback if Firebase isn't configured
    if (!hasValidConfig || !db) {
      console.warn("No Firebase Config: Dropping into Mock Mode Listener.");
      
      let fallbackState = generateSimulationData();
      
      setTimeout(() => {
        setStadiumData(fallbackState);
        setIsInitializing(false);
      }, 0);

      const interval = setInterval(() => {
        fallbackState = JSON.parse(JSON.stringify(fallbackState)); // deep clone
        Object.keys(fallbackState.zones).forEach(zone => {
          const currentDensity = fallbackState.zones[zone].densityScore;
          let newDensity = currentDensity + Math.floor(Math.random() * 31) - 15;
          if (newDensity < 0) newDensity = 0;
          if (newDensity > 100) newDensity = 100;
          fallbackState.zones[zone].densityScore = newDensity;

          if (fallbackState.queues[zone] !== undefined) {
             let newWait = fallbackState.queues[zone].waitTime + Math.floor(Math.random() * 7) - 3;
             const minWait = Math.floor((newDensity / 100) * 10);
             if (newWait < minWait) newWait = minWait;
             if (newWait > 60) newWait = 60;
             fallbackState.queues[zone].waitTime = newWait;
          }
        });
        setStadiumData(fallbackState);
      }, 3000);

      return () => clearInterval(interval);
    }

    const stadiumRef = ref(db, 'stadium');
    const unsubscribe = onValue(stadiumRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStadiumData(data);
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAIAction = (target) => {
    setActiveActionTarget(target);
    setTimeout(() => {
      setActiveActionTarget(null);
    }, 5000);
  };

  // Merge the zones and queues into the easy flat object expected by Map and Alerts
  const flattenedMapData = {};
  if (!isInitializing && stadiumData.zones) {
    Object.keys(stadiumData.zones).forEach(zone => {
       flattenedMapData[zone] = {
         densityScore: stadiumData.zones[zone].densityScore,
         waitTime: stadiumData.queues[zone]?.waitTime || 0
       };
    });
  }

  return (
    <main className={styles.main}>
      {/* Live Event Ticker */}
      <div className={styles.liveTicker}>
        <span className={styles.blinkingLive}>🔴 LIVE</span>
        Telemetry: {STADIUMS[selectedStadium].match} at {STADIUMS[selectedStadium].name}
      </div>

      <header className={styles.header}>
        <div className={styles.logoAndTitle}>
          <div className={styles.logo}>🏟️</div>
          <h1>Smart Stadium Analytics</h1>
        </div>
        <div className={styles.statusBadge}>
          {!isInitializing ? (
            <span className={styles.connected}>Network Connected</span>
          ) : (
            <span className={styles.connecting}>Initializing Matrix...</span>
          )}
        </div>
      </header>

      <div className={styles.dashboard}>
        {/* Main large area: Map or Schematic */}
        <div className={styles.mapSection}>
          
          <div className={styles.viewToggleGroup}>
            <div className={styles.segmentedToggle}>
              <button 
                className={`${styles.viewToggleBtn} ${viewMode === 'map' ? styles.activeView : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map View
              </button>
              <button 
                className={`${styles.viewToggleBtn} ${viewMode === 'schematic' ? styles.activeView : ''}`}
                onClick={() => setViewMode('schematic')}
              >
                📐 Schematic View
              </button>
            </div>

            <select 
              className={styles.stadiumSelect}
              value={selectedStadium} 
              onChange={(e) => setSelectedStadium(e.target.value)}
            >
              {Object.entries(STADIUMS).map(([key, stadium]) => (
                <option key={key} value={key}>{stadium.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.visualizerContainer}>
            {viewMode === 'map' ? (
              <StadiumMapGoogle 
                stadiumData={isInitializing ? null : flattenedMapData} 
                selectedStadium={selectedStadium}
                setSelectedStadium={setSelectedStadium}
                activeZone={activeZone}
                activeActionTarget={activeActionTarget}
              />
            ) : (
              <SchematicStadium 
                stadiumData={isInitializing ? null : flattenedMapData}
                activeZone={activeZone}
                activeActionTarget={activeActionTarget}
              />
            )}
          </div>
        </div>
        
        {/* Sidebar: Alerts and Queues */}
        <div className={styles.sidebar}>
          <SmartAlerts stadiumData={isInitializing ? null : flattenedMapData} />
          <QueueList 
            queues={isInitializing ? null : (stadiumData.queues || {})} 
            onZoneClick={(zoneName) => setActiveZone(activeZone === zoneName ? null : zoneName)}
            activeZone={activeZone}
          />
        </div>
      </div>

      {/* AI Command Center */}
      <AICommandBar 
        onActionTriggered={handleAIAction} 
        stadiumContext={{
          data: isInitializing ? null : flattenedMapData,
          stadiumInfo: STADIUMS[selectedStadium]
        }}
      />
    </main>
  );
}
