'use client';

import React, { useState } from 'react';
import styles from './StadiumMap.module.css';

export default function StadiumMap({ stadiumData }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  const getStatusDetails = (density) => {
    if (density < 40) return { class: styles.statusLow, name: 'Low' };
    if (density <= 75) return { class: styles.statusMedium, name: 'Medium' };
    return { class: styles.statusHigh, name: 'High' };
  };

  // Pre-defined visual layout coordinates to create an abstract map
  const zoneLayouts = {
    'Gate A': { top: '15%', left: '15%', type: 'gate' },
    'Gate B': { top: '15%', left: '85%', type: 'gate' },
    'Gate C': { top: '85%', left: '50%', type: 'gate' },
    'Food Stall 1': { top: '35%', left: '25%', type: 'food' },
    'Food Stall 2': { top: '35%', left: '75%', type: 'food' },
    'Restroom North': { top: '55%', left: '20%', type: 'restroom' },
    'Restroom South': { top: '55%', left: '80%', type: 'restroom' },
    'Seating Zone 1': { top: '50%', left: '50%', type: 'seating', width: '25%', height: '25%' },
    'Seating Zone 2': { top: '25%', left: '50%', type: 'seating', width: '25%', height: '15%' },
  };

  if (!stadiumData || Object.keys(stadiumData).length === 0) {
    return (
      <div className={`${styles.mapContainer} glass-panel`}>
        <div className={styles.skeletonMap}></div>
        <div className={styles.skeletonLegend}></div>
      </div>
    );
  }

  return (
    <div className={`${styles.mapContainer} glass-panel`}>
      <div className={styles.headerRow}>
        <h2 className={styles.mapTitle}>Live Crowd Map</h2>
        <div className={styles.liveIndicator}>
          <span className={styles.pulseDot}></span> Live
        </div>
      </div>
      
      <div className={styles.stadiumField}>
        {/* Render Field (Abstract) */}
        <div className={styles.pitch}></div>

        {/* Render Zones */}
        {Object.entries(zoneLayouts).map(([zoneName, layout]) => {
          const data = stadiumData[zoneName] || { densityScore: 0, waitTime: 0 };
          const density = data.densityScore;
          const status = getStatusDetails(density);
          
          return (
            <div
              key={zoneName}
              className={`${styles.zoneContainer}`}
              style={{
                top: layout.top,
                left: layout.left,
              }}
              onMouseEnter={() => setHoveredZone(zoneName)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              <div 
                className={`${styles.zoneMarker} ${status.class} ${styles[layout.type]}`}
                style={{
                  width: layout.width || '80px',
                  height: layout.height || '80px',
                }}
              >
                <div className={styles.zoneName}>{zoneName}</div>
                <div className={styles.densityIndicator}>
                  {density}%
                </div>
              </div>
              
              {/* Wait Time Badge */}
              {data.waitTime !== undefined && data.waitTime > 0 && (
                <div className={styles.waitTimeBadge}>
                  Wait: {data.waitTime} min
                </div>
              )}

              {/* Tooltip */}
              {hoveredZone === zoneName && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipTitle}>{zoneName}</div>
                  <div className={styles.tooltipStat}>Status: <span className={status.class}>{status.name}</span></div>
                  <div className={styles.tooltipStat}>Capacity: {Math.floor((density/100) * 500)}/500</div>
                  {data.waitTime !== undefined && <div className={styles.tooltipStat}>Avg Flow: {Math.max(1, Math.floor(40 - data.waitTime))} people/min</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={`${styles.dot} ${styles.statusLow}`}></span> Normal (&lt;40%)</div>
        <div className={styles.legendItem}><span className={`${styles.dot} ${styles.statusMedium}`}></span> Busy (40-75%)</div>
        <div className={styles.legendItem}><span className={`${styles.dot} ${styles.statusHigh}`}></span> Congested (&gt;75%)</div>
      </div>
    </div>
  );
}
