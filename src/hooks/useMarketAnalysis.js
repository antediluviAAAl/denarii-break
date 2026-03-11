import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useMarketStatus(coinId) {
  const [hasData, setHasData] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!coinId) {
      setChecking(false);
      return;
    }

    const check = async () => {
      try {
        const { count, error } = await supabase
          .from('d_price_analysis')
          .select('*', { count: 'exact', head: true })
          .eq('coin_id', coinId);

        if (error) throw error;
        setHasData(count > 0);
      } catch (err) {
        console.error('Error checking market status:', err);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [coinId]);

  return { hasData, checking };
}

export function useMarketAnalysis(coinData, isOpen) {
  // status can be: 'idle', 'loading_cache', 'polling', 'success', 'error'
  const [status, setStatus] = useState('idle'); 
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to check Supabase
  const checkCache = useCallback(async () => {
    const { data: cacheData, error: cacheError } = await supabase
      .from('d_price_analysis')
      .select('payload')
      .eq('coin_id', coinData?.coin_id)
      .single();

    // PGRST116 means "No rows returned", which is expected if it hasn't been scraped yet.
    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Supabase cache error:', cacheError);
      throw cacheError;
    }

    return cacheData?.payload || null;
  }, [coinData?.coin_id]);

  // Helper function to hit our Next.js API proxy
  const triggerScrape = useCallback(async () => {
    const response = await fetch('/api/market-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coin_id: coinData.coin_id,
        country: coinData.country, // Ensure your UI passes these mapped correctly!
        km: coinData.km,
        nominal: coinData.nominal, 
        year: coinData.year
      })
    });

    if (!response.ok) {
      throw new Error('Failed to trigger background scrape');
    }
  }, [coinData]);

  useEffect(() => {
    // Only run if the modal is open and we have data
    if (!isOpen || !coinData) return;

    let pollInterval;
    let isMounted = true;

    const analyzeMarket = async () => {
      try {
        setStatus('loading_cache');
        
        // 1. Check if we already have it forever cached
        const existingData = await checkCache();
        
        if (existingData) {
          if (isMounted) {
            setData(existingData);
            setStatus('success');
          }
          return; // We have data, exit early!
        }

        // 2. No data found. Trigger the Render backend
        if (isMounted) setStatus('polling');
        await triggerScrape();

        // 3. Start Polling Supabase every 3 seconds
        pollInterval = setInterval(async () => {
          const polledData = await checkCache();
          if (polledData) {
            clearInterval(pollInterval); // Stop polling!
            if (isMounted) {
              setData(polledData);
              setStatus('success');
            }
          }
        }, 3000);

      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setStatus('error');
        }
      }
    };

    analyzeMarket();

    // Cleanup function to prevent memory leaks if user closes modal early
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, coinData, checkCache, triggerScrape]);

  return { status, data, error };
}