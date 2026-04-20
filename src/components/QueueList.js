import React from 'react';
import styles from './QueueList.module.css';

export default function QueueList({ queues, onZoneClick, activeZone }) {
  if (!queues || Object.keys(queues).length === 0) {
    return (
      <div className={`${styles.queueContainer} glass-panel`}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonItem}></div>
        <div className={styles.skeletonItem}></div>
        <div className={styles.skeletonItem}></div>
      </div>
    );
  }

  // Convert queues object to array and sort by wait time
  const queueArray = Object.entries(queues)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.waitTime - a.waitTime);

  return (
    <div className={`${styles.queueContainer} glass-panel`}>
      <h2 className={styles.title}>Live Wait Times</h2>
      <div className={styles.list}>
        {queueArray.map((q) => {
          let statusClass = styles.statusLow;
          if (q.waitTime >= 15 && q.waitTime <= 30) statusClass = styles.statusMedium;
          if (q.waitTime > 30) statusClass = styles.statusHigh;

          const isActive = q.name === activeZone;

          return (
            <div 
              key={q.name} 
              className={`${styles.queueItem} ${isActive ? styles.activeQueueItem : ''}`}
              onClick={() => onZoneClick && onZoneClick(q.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.itemName}>{q.name}</div>
              <div className={styles.itemTime}>
                <div><span className={styles.timeNumber}>{q.waitTime}</span> <span className={styles.minLabel}>min</span></div>
                {/* Progress bar visual */}
                <div className={styles.progressBarBg}>
                  <div 
                    className={`${styles.progressBarFill} ${statusClass}`} 
                    style={{ 
                      width: `${Math.min(q.waitTime / 30 * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
