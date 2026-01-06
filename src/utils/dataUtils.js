/* src/utils/dataUtils.js */

export const processCoinData = (coin, ownedCache) => {
  const ownedData = ownedCache[coin.coin_id];
  const getImages = (side) => {
    if (!ownedData) return { full: null, medium: null, thumb: null };
    const full = ownedData.full[side];
    const medium = ownedData.medium[side] || full;
    const thumb = ownedData.thumb[side] || medium || full;
    return { full, medium, thumb };
  };

  return {
    ...coin,
    is_owned: !!ownedData,
    images: {
      obverse: getImages("obverse"),
      reverse: getImages("reverse"),
    },
  };
};

export const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// --- COUNTRY HIERARCHY ---
export const buildHierarchy = (rawCountries) => {
  const hierarchyMap = {};

  rawCountries.forEach((c) => {
    const ultId = c.ultimate_entity_id;
    if (!hierarchyMap[ultId]) {
      hierarchyMap[ultId] = {
        id: ultId,
        name: c.ultimate_entity_name,
        isComposite: false,
        children: [],
        totalCount: 0,
      };
    }

    if (c.parent_name === c.ultimate_entity_name) {
      hierarchyMap[ultId].isComposite = true;
    }

    const childCount = c.coin_count || 0;
    const childWithCount = { ...c, count: childCount };

    hierarchyMap[ultId].children.push(childWithCount);
    hierarchyMap[ultId].totalCount += childCount;
  });

  // Sort Children (Countries): Alphabetical
  Object.values(hierarchyMap).forEach((group) => {
    group.children.sort((a, b) => a.country_name.localeCompare(b.country_name));
  });

  // Sort Groups (Ultimate): Alphabetical
  return Object.values(hierarchyMap).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

// --- PERIOD HIERARCHY ---
export const buildPeriodHierarchy = (rawPeriods) => {
  const map = {};

  rawPeriods.forEach((row) => {
    const pId = row.period_id;
    if (!map[pId]) {
      map[pId] = {
        id: pId,
        name: row.period_name,
        shorthand: row.period_shorthand || row.period_name,
        start_year: row.period_start_year,
        range: row.period_range || row.period_start_year,
        children: [],
        isComposite: false,
      };
    }

    if (row.b_periods_countries && Array.isArray(row.b_periods_countries)) {
      row.b_periods_countries.forEach((link) => {
        if (link.d_countries) {
          map[pId].children.push({
            country_id: link.country_id,
            country_name: link.d_countries.country_name,
            ultimate_entity_id: link.d_countries.ultimate_entity_id,
          });
        }
      });
    }
  });

  const hierarchy = Object.values(map);

  hierarchy.forEach((h) => {
    if (h.children.length > 1) {
      h.isComposite = true;
    }
    h.children.sort((a, b) => a.country_name.localeCompare(b.country_name));
  });

  // Sort: Descending by Year (Newest First)
  return hierarchy.sort((a, b) => {
    const yearA = a.start_year || -9999;
    const yearB = b.start_year || -9999;
    if (yearB !== yearA) return yearB - yearA;
    return a.name.localeCompare(b.name);
  });
};

// --- TIMELINE GROUPING (NEW) ---
export const groupPeriodsByYear = (periods) => {
  const groups = [];
  let currentYear = null;
  let currentGroup = null;

  periods.forEach((period) => {
    // Handle periods with no start year
    const pYear = period.start_year || "Unknown";

    if (pYear !== currentYear) {
      currentYear = pYear;
      currentGroup = { year: currentYear, periods: [] };
      groups.push(currentGroup);
    }
    currentGroup.periods.push(period);
  });

  return groups;
};
