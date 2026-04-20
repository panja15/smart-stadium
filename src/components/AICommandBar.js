'use client';

import React, { useState } from 'react';
import styles from './AICommandBar.module.css';

export default function AICommandBar({ onActionTriggered, stadiumContext }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: query,
          context: stadiumContext
        })
      });

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      
      // Notify parent to trigger visualization pulse
      if (data.target && onActionTriggered) {
        onActionTriggered(data.target);
      }

      // Show structured JSON as a Toast
      setToast({
        action: data.action,
        target: data.target,
        message: data.message
      });

      setQuery('');

      // Auto dismiss Toast
      setTimeout(() => setToast(null), 5000);

    } catch (err) {
      console.error(err);
      setToast({ action: 'ERROR', message: 'Failed to dispatch command.' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className={styles.commandBarWrapper}>
        <form onSubmit={handleSubmit} className={styles.commandForm}>
          <div className={styles.inputContainer}>
            <span className={styles.sparkleIcon}>✨</span>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is the closest Food Stall near East Gate?..." 
              className={styles.commandInput}
              disabled={isProcessing}
            />
            <button 
              type="submit" 
              className={styles.executeButton}
              disabled={isProcessing || !query.trim()}
            >
              {isProcessing ? 'Processing' : 'Execute'}
            </button>
          </div>
        </form>
      </div>

      {toast && (
        <div className={`${styles.toastOverlay} ${toast ? styles.show : ''}`}>
          <div className={styles.toastContent}>
            <div className={styles.toastHeader}>
              <span className={styles.toastAction}>{toast.action}</span>
              {toast.target && <span className={styles.toastTarget}>Target: {toast.target}</span>}
            </div>
            <div className={styles.toastMessage}>{toast.message}</div>
          </div>
        </div>
      )}
    </>
  );
}
