'use client';

import { useState, useEffect } from 'react';

interface VideoStatus {
  available: boolean;
  loading: boolean;
  count: number;
}

export function useVideoStatus(): VideoStatus {
  const [status, setStatus] = useState<VideoStatus>({
    available: false,
    loading: true,
    count: 0
  });

  useEffect(() => {
    async function checkVideoStatus() {
      try {
        const response = await fetch('/api/videos?limit=1');
        const data = await response.json();
        
        if (data.success) {
          setStatus({
            available: data.data.length > 0,
            loading: false,
            count: data.data.length
          });
        } else {
          setStatus({
            available: false,
            loading: false,
            count: 0
          });
        }
      } catch (error) {
        console.error('Error checking video status:', error);
        setStatus({
          available: false,
          loading: false,
          count: 0
        });
      }
    }

    checkVideoStatus();
  }, []);

  return status;
}

// Hook for redirecting to maintenance if videos are not available
export function useVideoRedirect() {
  const { available, loading } = useVideoStatus();

  useEffect(() => {
    if (!loading && !available) {
      window.location.href = '/videos/maintenance';
    }
  }, [available, loading]);

  return { available, loading };
}