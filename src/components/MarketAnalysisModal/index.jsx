"use client";

import React, { useState, useMemo } from 'react';
import { 
  X, Activity, History, ArrowDownToLine, ArrowUpFromLine, 
  TrendingUp, TrendingDown, Store, AlertTriangle
} from 'lucide-react';
import { useMarketAnalysis } from '../../hooks/useMarketAnalysis';
import styles from './MarketAnalysisModal.module.css';

export default function MarketAnalysisModal({ isOpen, onClose, coinData }) {
  const { status, data, error } = useMarketAnalysis(coinData, isOpen);

  // Local UI State
  const [currentMode, setCurrentMode] = useState('NGC');
  const [activeFilter, setActiveFilter] = useState('ALL');
  
  // Sorting States
  const [sortActive, setSortActive] = useState({ key: 'price', dir: 'asc' });
  const [sortSold, setSortSold] = useState({ key: 'date', dir: 'desc' });

  if (!isOpen) return null;

  // --- Helper: Baselines & Deltas ---
  const getBaselineData = () => {
    if (!data || !data.baselines) return {};
    const source = currentMode === 'NGC' ? data.baselines.ngc : data.baselines.numista;
    if (!source || source.length === 0) return {};
    return source[0].NGC_baseline_prices || {}; 
  };

  const currentBaseline = getBaselineData();

  const getDeltaParams = (price, grade) => {
    if (grade === 'UNGRADED' || !currentBaseline[grade]) return null;
    const baseVal = currentBaseline[grade];
    const perc = ((price - baseVal) / baseVal) * 100;
    
    if (price > baseVal) {
      return { perc: Math.round(perc), isOver: true, color: '#ef4444' }; // Red
    } else {
      return { perc: Math.abs(Math.round(perc)), isOver: false, color: '#10b981' }; // Green
    }
  };

  // --- Sorting & Filtering Engine ---
  const parseCustomDate = (d) => {
    if (!d || d === 'Active' || d === 'Live') return Infinity;
    if (d === 'Recent' || d === 'Unknown') return 0;
    const timestamp = Date.parse(d);
    return isNaN(timestamp) ? 0 : timestamp;
  };

  const processListings = (listings, sortConfig) => {
    if (!listings) return [];
    let filtered = listings;
    
    if (activeFilter !== 'ALL') {
      filtered = listings.filter(item => item.grade === activeFilter);
    }
    
    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'price') {
        return sortConfig.dir === 'asc' ? a.price_usd - b.price_usd : b.price_usd - a.price_usd;
      }
      if (sortConfig.key === 'date') {
        const dateA = parseCustomDate(a.date);
        const dateB = parseCustomDate(b.date);
        return sortConfig.dir === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  const processedActive = useMemo(() => processListings(data?.active_listings, sortActive), [data, activeFilter, sortActive]);
  const processedSold = useMemo(() => processListings(data?.sold_listings, sortSold), [data, activeFilter, sortSold]);

  // --- RENDERERS ---
  const renderLoadingState = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>Aggregating Global Market Data...</div>
      <div className={styles.loadingSubtext}>
        Deploying headless crawlers to NGC, Numista, eBay, and MA-Shops. Bypassing WAF protections and normalizing liquidity matrices.
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className={styles.loadingContainer}>
      <AlertTriangle size={48} color="#ef4444" style={{marginBottom: 20}} />
      <div className={styles.loadingText} style={{color: '#ef4444'}}>Analysis Failed</div>
      <div className={styles.loadingSubtext}>{error || "The market aggregator timed out or is currently unavailable."}</div>
    </div>
  );

  const renderCard = (item, idx) => {
    const delta = getDeltaParams(item.price_usd, item.grade);
    let sourceColor = '#3b82f6'; // MA-Shops default blue
    if (item.source === 'Ebay') sourceColor = '#10b981'; // Green
    if (item.source === 'Okazii') sourceColor = '#f59e0b'; // Yellow

    return (
      <a key={idx} href={item.item_url} className={styles.card} target="_blank" rel="noopener noreferrer">
        <img className={styles.cardImg} src={item.image_url || '/images/placeholder.png'} alt="Coin" />
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <div className={styles.cardSource} style={{ background: sourceColor }}>{item.source}</div>
            <div className={styles.cardDate}>{item.date}</div>
          </div>
          <div className={styles.cardTitle}>{item.info}</div>
          
          <div className={styles.cardFooter}>
            <div className={styles.cardGrade}>{item.grade}</div>
            <div className={styles.cardPriceWrapper}>
              <div className={styles.cardPrice}>${item.price_usd.toFixed(2)}</div>
              {delta && (
                <div className={styles.cardDelta} style={{ color: delta.color }}>
                  {delta.isOver ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {delta.perc}% base
                </div>
              )}
            </div>
          </div>

        </div>
      </a>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>

        {status === 'error' && renderErrorState()}
        {(status === 'idle' || status === 'loading_cache' || status === 'polling') && renderLoadingState()}

        {status === 'success' && data && (
          <>
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <h1 className={styles.title}><Activity size={28} color="var(--primary)" /> Market Matrix</h1>
                <div className={styles.subtitle}>
                  Aggregated Intelligence: <strong>{coinData.country} {coinData.nominal} {coinData.year} / KM# {coinData.km}</strong>
                </div>
              </div>
              
              {/* KPI DASHBOARD */}
              <div className={styles.kpiDashboard}>
                <div className={`${styles.kpiCard} ${styles.kpiCardActive}`}>
                  <div className={styles.kpiHeader}><Store size={18} color="var(--primary)"/> Live Retail (Asking)</div>
                  <div className={styles.kpiGrid}>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Floor</span>
                      <span className={styles.kpiValue}>${data.metrics?.active?.min || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Average</span>
                      <span className={styles.kpiValue}>${data.metrics?.active?.average || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Median</span>
                      <span className={`${styles.kpiValue} ${styles.kpiValueHighlight}`}>${data.metrics?.active?.median || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Ceiling</span>
                      <span className={styles.kpiValue}>${data.metrics?.active?.max || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Supply</span>
                      <span className={styles.kpiValue}>{data.metrics?.active?.supply || 0}</span>
                    </div>
                  </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiCardSold}`}>
                  <div className={styles.kpiHeader}><History size={18} color="#10b981"/> Historical Liquidity (Sold)</div>
                  <div className={styles.kpiGrid}>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Floor</span>
                      <span className={styles.kpiValue}>${data.metrics?.sold?.min || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Average</span>
                      <span className={styles.kpiValue}>${data.metrics?.sold?.average || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Median</span>
                      <span className={styles.kpiValue} style={{color: '#10b981'}}>${data.metrics?.sold?.median || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Record</span>
                      <span className={styles.kpiValue}>${data.metrics?.sold?.max || '-'}</span>
                    </div>
                    <div className={styles.kpiMetric}>
                      <span className={styles.kpiLabel}>Volume</span>
                      <span className={styles.kpiValue}>{data.metrics?.sold?.supply || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BASELINE CONTROLS */}
            <div className={styles.guideBox}>
              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentBtn} ${currentMode === 'NGC' ? styles.segmentBtnActiveNgc : ''}`}
                  onClick={() => setCurrentMode('NGC')}
                >NGC Base</button>
                <button 
                  className={`${styles.segmentBtn} ${currentMode === 'NUMISTA' ? styles.segmentBtnActiveNumista : ''}`}
                  onClick={() => setCurrentMode('NUMISTA')}
                >Numista Base</button>
              </div>

              <div className={styles.guidePills}>
                <button 
                  className={`${styles.guidePill} ${activeFilter === 'ALL' ? styles.guidePillActive : ''}`} 
                  onClick={() => setActiveFilter('ALL')}
                >
                  <span className={styles.pillGrade}>ALL GRADES</span>
                </button>

                {['PrAg', 'G', 'VG', 'F', 'VF', 'XF', 'AU', 'UNC'].map(g => {
                  const val = currentBaseline[g];
                  const isDisabled = val === null || val === undefined;
                  
                  return (
                    <button 
                      key={g} 
                      disabled={isDisabled}
                      className={`${styles.guidePill} ${activeFilter === g ? styles.guidePillActive : ''} ${isDisabled ? styles.guidePillDisabled : ''}`} 
                      onClick={() => !isDisabled && setActiveFilter(g)}
                    >
                      <span className={styles.pillGrade}>{g}</span> 
                      {val && <span className={styles.pillVal}>${val}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE GRID */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><Store size={20} color="var(--primary)"/> Live Retail Market</h2>
              <div className={styles.sortControls}>
                <button 
                  className={`${styles.sortBtn} ${sortActive.key === 'price' && sortActive.dir === 'asc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortActive({key: 'price', dir: 'asc'})}
                >Price <ArrowUpFromLine size={14}/></button>
                <button 
                  className={`${styles.sortBtn} ${sortActive.key === 'price' && sortActive.dir === 'desc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortActive({key: 'price', dir: 'desc'})}
                >Price <ArrowDownToLine size={14}/></button>
              </div>
            </div>
            <div className={styles.grid}>
              {processedActive.length > 0 ? processedActive.map((item, idx) => renderCard(item, idx)) : <p style={{color: 'var(--text-secondary)'}}>No active listings match the selected grade.</p>}
            </div>

            {/* SOLD GRID */}
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}><History size={20} color="#10b981"/> Historical Sold Market</h2>
              <div className={styles.sortControls}>
                <button 
                  className={`${styles.sortBtn} ${sortSold.key === 'date' && sortSold.dir === 'desc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortSold({key: 'date', dir: 'desc'})}
                >Recent <ArrowDownToLine size={14}/></button>
                <button 
                  className={`${styles.sortBtn} ${sortSold.key === 'date' && sortSold.dir === 'asc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortSold({key: 'date', dir: 'asc'})}
                >Oldest <ArrowUpFromLine size={14}/></button>
                <span style={{width: '1px', background: 'var(--border-color)', margin: '0 4px'}}></span>
                <button 
                  className={`${styles.sortBtn} ${sortSold.key === 'price' && sortSold.dir === 'desc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortSold({key: 'price', dir: 'desc'})}
                >Price <ArrowDownToLine size={14}/></button>
                <button 
                  className={`${styles.sortBtn} ${sortSold.key === 'price' && sortSold.dir === 'asc' ? styles.sortBtnActive : ''}`} 
                  onClick={() => setSortSold({key: 'price', dir: 'asc'})}
                >Price <ArrowUpFromLine size={14}/></button>
              </div>
            </div>
            <div className={styles.grid}>
              {processedSold.length > 0 ? processedSold.map((item, idx) => renderCard(item, idx)) : <p style={{color: 'var(--text-secondary)'}}>No sold listings match the selected grade.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}