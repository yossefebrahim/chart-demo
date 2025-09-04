import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { colorFor, lerpColor } from './utils/colors';
import correlationData from './data/corr.json';

function App() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [specificPeriod, setSpecificPeriod] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [highColor, setHighColor] = useState('#0046D4');
  const [lowColor, setLowColor] = useState('#CCDAF6');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const matrixOnlyRef = useRef(null);

  const { period, assets, matrix } = correlationData;

  // Close export options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportOptions && !event.target.closest('.export-dropdown')) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportOptions]);

  // Format correlation value (remove leading zero for positive values)
  const formatCorrelation = (value) => {
    if (value === null || value === undefined) return '';
    const formatted = value.toFixed(2);
    return formatted.startsWith('0.') ? formatted.slice(1) : formatted;
  };

  // Format correlation value for tooltip (with sign)
  const formatTooltipCorrelation = (value) => {
    if (value === null || value === undefined) return '';
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const handleCellHover = (rowIndex, colIndex, value) => {
    setHoveredCell({ row: rowIndex, col: colIndex, value });
    setHoveredRow(rowIndex);
    setHoveredCol(colIndex);
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
    setHoveredRow(null);
    setHoveredCol(null);
  };

  // Reset colors to default
  const resetColors = () => {
    setHighColor('#0046D4');
    setLowColor('#CCDAF6');
  };

  // Export correlation matrix as image (matrix only)
  const exportAsImage = async (format = 'png', quality = 2) => {
    if (!matrixOnlyRef.current) return;
    
    setIsExporting(true);
    setShowExportOptions(false);
    
    try {
      // Hide any hover effects during export
      setHoveredCell(null);
      setHoveredRow(null);
      setHoveredCol(null);
      
      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(matrixOnlyRef.current, {
        backgroundColor: '#ffffff',
        scale: quality, // Quality multiplier
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: matrixOnlyRef.current.scrollWidth,
        height: matrixOnlyRef.current.scrollHeight,
      });
      
      // Create download link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `correlation-matrix-${period.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${format}`;
      
      if (format === 'jpg' || format === 'jpeg') {
        link.href = canvas.toDataURL('image/jpeg', 0.9);
      } else {
        link.href = canvas.toDataURL('image/png');
      }
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Create gradient for legend using current colors
  const createGradient = () => {
    const steps = 100;
    const gradientStops = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const color = lerpColor(highColor, lowColor, t);
      gradientStops.push(`${color} ${(t * 100).toFixed(1)}%`);
    }
    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  };

  // Generate legend dots with current colors
  const generateLegendDots = () => {
    const dots = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7; // 0 to 1
      const color = lerpColor(lowColor, highColor, t);
      dots.push(color);
    }
    return dots;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Holding correlation</h1>
            
            {/* Export Button and Period Toggle */}
            <div className="flex items-start space-x-4">
              {/* Export Button */}
              <div className="relative export-dropdown">
                <div className="flex">
                  <button
                    onClick={() => exportAsImage()}
                    disabled={isExporting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-l-lg transition-colors text-sm font-medium"
                    title="Export as PNG image"
                  >
                    {isExporting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    disabled={isExporting}
                    className="px-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-r-lg border-l border-blue-500 transition-colors"
                    title="Export options"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Export Options Dropdown */}
                {showExportOptions && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Export Format</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => exportAsImage('png', 2)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center justify-between"
                        >
                          <span>PNG (High Quality)</span>
                          <span className="text-xs text-gray-500">Recommended</span>
                        </button>
                        <button
                          onClick={() => exportAsImage('png', 1)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          PNG (Standard Quality)
                        </button>
                        <button
                          onClick={() => exportAsImage('jpg', 2)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          JPEG (Smaller File)
                        </button>
                      </div>
                    </div>
                    <div className="p-3 text-xs text-gray-500">
                      Files are saved as: correlation-matrix-{period.toLowerCase()}-YYYY-MM-DD.format
                    </div>
                  </div>
                )}
              </div>

              {/* Period Toggle */}
              <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="period"
                  checked={specificPeriod}
                  onChange={() => setSpecificPeriod(true)}
                  className="text-blue-600"
                />
                <span className="text-gray-700">Pick specific period</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  {period}
                </span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="period"
                  checked={!specificPeriod}
                  onChange={() => setSpecificPeriod(false)}
                  disabled
                  className="text-gray-400"
                />
                <span className="text-gray-400">Pick overall period</span>
              </label>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col items-center mb-6 space-y-4">
            {/* Color Scale */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Low Correlation</span>
              <div className="flex items-center space-x-2">
                {/* Colored dots showing correlation scale */}
                <div className="flex space-x-1">
                  {generateLegendDots().map((color, index) => (
                    <div 
                      key={index}
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-600">High Correlation</span>
              
              {/* Color Customization Toggle */}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="ml-4 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Customize colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m0 20v-2m4-8h10m-9-4h9m-9 8h9m-9-4h9" />
                </svg>
              </button>
            </div>

            {/* Color Picker Panel */}
            {showColorPicker && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Low Correlation:</label>
                    <input
                      type="color"
                      value={lowColor}
                      onChange={(e) => setLowColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-mono">{lowColor}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">High Correlation:</label>
                    <input
                      type="color"
                      value={highColor}
                      onChange={(e) => setHighColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500 font-mono">{highColor}</span>
                  </div>

                  <button
                    onClick={resetColors}
                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Correlation Matrix */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full" ref={matrixOnlyRef}>
              {/* Column Headers */}
              <div className="flex mb-2">
                <div className="w-64 flex-shrink-0"></div> {/* Space for row labels */}
                {assets.map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-16 h-8 flex items-center justify-center text-xs font-medium border-r border-gray-200 ${
                      hoveredCol === colIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {colIndex + 1}
                  </div>
                ))}
              </div>

              {/* Matrix Rows */}
              {assets.map((asset, rowIndex) => (
                <div key={rowIndex} className="flex border-b border-gray-100">
                  {/* Row Label */}
                  <div className={`w-64 flex-shrink-0 flex items-center px-4 py-3 text-sm ${
                    hoveredRow === rowIndex ? 'bg-blue-50' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className={`font-medium ${
                        hoveredRow === rowIndex ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {rowIndex + 1}
                      </span>
                      <span className={`truncate ${
                        hoveredRow === rowIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {asset}
                      </span>
                    </div>
                  </div>

                  {/* Matrix Cells */}
                  {assets.map((_, colIndex) => {
                    const value = matrix[rowIndex][colIndex];
                    const isVisible = colIndex <= rowIndex && value !== null;
                    
                    return (
                      <div
                        key={colIndex}
                        className={`w-16 h-12 flex items-center justify-center border border-white text-xs font-medium relative ${
                          isVisible ? 'cursor-pointer' : ''
                        }`}
                        style={{
                          backgroundColor: isVisible ? colorFor(value, highColor, lowColor) : 'transparent',
                          visibility: isVisible ? 'visible' : 'hidden'
                        }}
                        onMouseEnter={() => isVisible && handleCellHover(rowIndex, colIndex, value)}
                        onMouseLeave={handleCellLeave}
                      >
                        {isVisible && (
                          <span className="text-white font-medium">
                            {formatCorrelation(value)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Values are correlations in [-1,1].
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-50 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="font-medium">
              {assets[hoveredCell.row]} × {assets[hoveredCell.col]}
            </div>
            <div className="text-gray-300">
              Correlation: {formatTooltipCorrelation(hoveredCell.value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
