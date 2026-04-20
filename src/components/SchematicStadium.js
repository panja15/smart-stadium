'use client';

import React from 'react';
import styles from './SchematicStadium.module.css';

// Approximate visual mappings
const posMap = {
  'North Stand': { top: '5%', left: '50%', transform: 'translate(-50%, 0)' },
  'South Pavilion': { bottom: '5%', left: '50%', transform: 'translate(-50%, 0)' },
  'Pavilion End': { bottom: '15%', left: '30%', transform: 'translate(-50%, 0)' },
  'VIP Enclosure': { top: '50%', left: '5%', transform: 'translate(0, -50%)', rotate: '-90deg' },
  'East Gate': { top: '50%', right: '5%', transform: 'translate(0, -50%)' },
  'West Gate': { top: '20%', left: '10%' },
  'Food Court A': { top: '20%', right: '15%' },
  'Restroom Block 1': { bottom: '20%', right: '15%' }
};

export default function SchematicStadium({ stadiumData, activeZone, activeActionTarget }) {
  if (!stadiumData) return <div className={styles.loading}>Connecting schematic array...</div>;

  const zones = Object.keys(stadiumData);

  return (
    <div className={styles.schematicWrapper}>
      {/* Outer Pitch Wrapper */}
      <div className={styles.pitchArea}>
        <div className={styles.innerPitch}>
          <div className={styles.wicket}></div>
        </div>
      </div>

      {/* Ranged Zones */}
      {zones.map(zoneName => {
        const data = stadiumData[zoneName];
        if (!data) return null;
        
        const isHovered = activeZone === zoneName;
        const isActionActive = activeActionTarget === zoneName;
        const pos = posMap[zoneName] || { top: '50%', left: '50%' };

        // Color extraction based on threshold
        let densityColor = 'var(--status-low)';
        if (data.densityScore > 33) densityColor = 'var(--status-medium)';
        if (data.densityScore > 66) densityColor = 'var(--status-high)';

        return (
          <div 
            key={zoneName}
            className={`${styles.schematicBlock} ${isHovered ? styles.hovered : ''} ${isActionActive ? styles.actionPulse : ''}`}
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              right: pos.right,
              transform: `${pos.transform || ''} ${pos.rotate ? `rotate(${pos.rotate})` : ''}`,
            }}
          >
            <div className={styles.densityIndicator} style={{ backgroundColor: densityColor }}></div>
            <div className={styles.blockInfo}>
              <strong>{zoneName}</strong>
              <div className={styles.blockStats}>
                <span>Crowd: {data.densityScore}%</span>
                {data.waitTime !== undefined && <span>Wait: {data.waitTime}m</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
