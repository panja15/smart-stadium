import React from 'react';
import styles from './SmartAlerts.module.css';

export default function SmartAlerts({ stadiumData }) {
  if (!stadiumData || Object.keys(stadiumData).length === 0) {
    return (
      <div className={`${styles.container} glass-panel`}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonCard}></div>
        <div className={styles.skeletonCard}></div>
      </div>
    );
  }

  // Generate alerts based on capacity > 80%
  const getAlerts = () => {
    const alerts = [];
    
    // Sort gates by density to find the least crowded gate for rerouting
    const gates = Object.entries(stadiumData)
      .filter(([name]) => name.includes('Gate'))
      .sort((a, b) => a[1].densityScore - b[1].densityScore);

    const bestGate = gates[0]?.[0] || 'another gate';

    Object.entries(stadiumData).forEach(([zoneName, data]) => {
      // Logic 1: Gate Congestion
      if (zoneName.includes('Gate')) {
        if (data.densityScore > 80 || data.waitTime > 25) {
          alerts.push({
            id: zoneName,
            level: 'critical',
            message: `🚨 ${zoneName} Congestion. Rerouting traffic to ${bestGate}.`
          });
        }
      } 
      // Logic 2: Amenity Bottlenecks (Food Courts / Restrooms)
      else if (zoneName.includes('Food') || zoneName.includes('Restroom')) {
        if (data.waitTime > 30) {
          alerts.push({
            id: zoneName,
            level: 'warning',
            message: `⚠️ High wait times (${data.waitTime} min) at ${zoneName}.`
          });
        } else if (data.densityScore > 90) {
          alerts.push({
            id: zoneName,
            level: 'warning',
            message: `📈 ${zoneName} is reaching peak capacity (${data.densityScore}%).`
          });
        }
      }
      // Note: We ignore Seating Stands (Pavilion/Stand/Enclosure) to reduce noise, 
      // as high fan density in seats is normal and expected during match play.
    });

    return alerts;
  };

  const alerts = getAlerts();

  return (
    <div className={`${styles.container} glass-panel`}>
      <h2 className={styles.title}>
        <span className={styles.pulseDot}></span>
        Smart Alerts Feed
      </h2>
      
      <div className={styles.alertList}>
        {alerts.length === 0 ? (
          <div className={styles.emptyState}>All systems operational. No current alerts.</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`${styles.alertCard} ${styles[alert.level]}`}>
              <div className={styles.alertContent}>
                {alert.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
