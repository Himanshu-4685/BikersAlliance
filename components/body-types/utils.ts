// Helper function to get body type icon based on name
export const getBodyTypeIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('commuter')) return '🚴';
  if (lowerName.includes('sports') || lowerName.includes('sport')) return '🏍️';
  if (lowerName.includes('cruiser')) return '🛣️';
  if (lowerName.includes('adventure')) return '⛰️';
  if (lowerName.includes('scooter')) return '🛵';
  if (lowerName.includes('electric')) return '⚡';
  if (lowerName.includes('naked')) return '🔧';
  if (lowerName.includes('super')) return '🚀';
  if (lowerName.includes('touring') || lowerName.includes('tourer')) return '🗺️';
  if (lowerName.includes('off-road') || lowerName.includes('dirt')) return '🏔️';
  if (lowerName.includes('cafe')) return '☕';
  if (lowerName.includes('scrambler')) return '🛠️';
  if (lowerName.includes('street')) return '🏙️';
  if (lowerName.includes('roadster')) return '🛤️';
  if (lowerName.includes('moped')) return '🚲';
  
  return '🏍️'; // Default icon
};

// Helper function to get body type description
export const getBodyTypeDescription = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('commuter')) {
    return 'Practical bikes designed for daily commuting with good fuel efficiency and comfort.';
  }
  if (lowerName.includes('sports') || lowerName.includes('sport')) {
    return 'High-performance motorcycles built for speed, agility, and track performance.';
  }
  if (lowerName.includes('cruiser')) {
    return 'Relaxed riding position bikes perfect for long-distance touring and highway cruising.';
  }
  if (lowerName.includes('adventure')) {
    return 'Versatile motorcycles capable of both on-road and off-road adventures.';
  }
  if (lowerName.includes('scooter')) {
    return 'Easy-to-ride automatic vehicles perfect for city commuting and short trips.';
  }
  if (lowerName.includes('electric')) {
    return 'Eco-friendly vehicles powered by electric motors for sustainable transportation.';
  }
  if (lowerName.includes('naked')) {
    return 'Minimalist motorcycles without fairings, offering an authentic riding experience.';
  }
  if (lowerName.includes('super')) {
    return 'Ultimate performance machines with cutting-edge technology and extreme power.';
  }
  if (lowerName.includes('touring')) {
    return 'Comfort-focused motorcycles designed for long-distance travel with luggage capacity.';
  }
  if (lowerName.includes('dirt') || lowerName.includes('off-road')) {
    return 'Rugged motorcycles built for off-road terrain and challenging conditions.';
  }
  if (lowerName.includes('cafe')) {
    return 'Retro-styled motorcycles with a minimalist design inspired by café racer culture.';
  }
  if (lowerName.includes('scrambler')) {
    return 'Versatile bikes with a rugged design suitable for both city and light off-road use.';
  }
  if (lowerName.includes('street')) {
    return 'Urban-focused motorcycles designed for city riding and daily use.';
  }
  if (lowerName.includes('roadster')) {
    return 'Sporty motorcycles with upright riding position for spirited road riding.';
  }
  
  return 'Discover motorcycles designed for specific riding styles and preferences.';
};