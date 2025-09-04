/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#FF0000")
 * @returns {Object} RGB object with r, g, b properties
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB values to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Interpolate between two hex colors
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated hex color
 */
export function lerpColor(hex1, hex2, t) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided');
  }
  
  const r = rgb1.r + (rgb2.r - rgb1.r) * t;
  const g = rgb1.g + (rgb2.g - rgb1.g) * t;
  const b = rgb1.b + (rgb2.b - rgb1.b) * t;
  
  return rgbToHex(r, g, b);
}

/**
 * Get color for correlation value
 * Maps correlation values from [-1, 1] to color gradient from high to low colors
 * @param {number} value - Correlation value (-1 to 1)
 * @param {string} highColor - Color for high correlation (default: #2B65DB)
 * @param {string} lowColor - Color for low correlation (default: #CCDAF6)
 * @returns {string} Hex color string
 */
export function colorFor(value, highColor = '#2B65DB', lowColor = '#CCDAF6') {
  // Map [-1, 1] to [0, 1] range
  const t = Math.max(0, Math.min(1, (value + 1) / 2));
  
  // Use 1-t so that high correlation (close to 1) gets highColor
  // and low correlation (close to -1) gets lowColor
  return lerpColor(highColor, lowColor, 1 - t);
}
