import React, { useState } from 'react';
import './KarnatakaMap.css';

// Complete dataset for all 31 districts with health metrics
const districtData = {
  'Bagalkot': { population: 1890826, anemia_rate: 58.3, health_score: 41.7, health_centers: 45, pad_centers: 12, region: 'North', coordinates: { row: 2, col: 4 } },
  'Bengaluru Urban': { population: 9621551, anemia_rate: 45.7, health_score: 54.3, health_centers: 320, pad_centers: 85, region: 'South', coordinates: { row: 6, col: 5 } },
  'Bengaluru Rural': { population: 987257, anemia_rate: 52.1, health_score: 47.9, health_centers: 78, pad_centers: 23, region: 'South', coordinates: { row: 6, col: 4 } },
  'Belagavi': { population: 4779661, anemia_rate: 62.4, health_score: 37.6, health_centers: 156, pad_centers: 34, region: 'North', coordinates: { row: 1, col: 2 } },
  'Ballari': { population: 2452595, anemia_rate: 64.1, health_score: 35.9, health_centers: 89, pad_centers: 18, region: 'Central', coordinates: { row: 4, col: 3 } },
  'Bidar': { population: 1703300, anemia_rate: 59.8, health_score: 40.2, health_centers: 67, pad_centers: 15, region: 'North', coordinates: { row: 1, col: 6 } },
  'Vijayapura': { population: 2177102, anemia_rate: 61.2, health_score: 38.8, health_centers: 72, pad_centers: 14, region: 'North', coordinates: { row: 2, col: 3 } },
  'Chamarajanagar': { population: 1020791, anemia_rate: 65.3, health_score: 34.7, health_centers: 54, pad_centers: 11, region: 'South', coordinates: { row: 8, col: 5 } },
  'Chikkaballapur': { population: 1254104, anemia_rate: 58.9, health_score: 41.1, health_centers: 48, pad_centers: 10, region: 'South', coordinates: { row: 5, col: 5 } },
  'Chikkamagaluru': { population: 1137752, anemia_rate: 56.4, health_score: 43.6, health_centers: 62, pad_centers: 13, region: 'Central', coordinates: { row: 4, col: 5 } },
  'Chitradurga': { population: 1659257, anemia_rate: 60.5, health_score: 39.5, health_centers: 58, pad_centers: 12, region: 'Central', coordinates: { row: 4, col: 4 } },
  'Dakshina Kannada': { population: 2089649, anemia_rate: 48.2, health_score: 51.8, health_centers: 112, pad_centers: 28, region: 'Coastal', coordinates: { row: 6, col: 1 } },
  'Davanagere': { population: 1945497, anemia_rate: 59.3, health_score: 40.7, health_centers: 76, pad_centers: 16, region: 'Central', coordinates: { row: 3, col: 4 } },
  'Dharwad': { population: 1847023, anemia_rate: 57.2, health_score: 42.8, health_centers: 84, pad_centers: 19, region: 'North', coordinates: { row: 2, col: 2 } },
  'Gadag': { population: 1064570, anemia_rate: 60.8, health_score: 39.2, health_centers: 43, pad_centers: 9, region: 'Central', coordinates: { row: 3, col: 3 } },
  'Hassan': { population: 1776421, anemia_rate: 58.1, health_score: 41.9, health_centers: 68, pad_centers: 14, region: 'South', coordinates: { row: 5, col: 3 } },
  'Haveri': { population: 1597668, anemia_rate: 61.5, health_score: 38.5, health_centers: 55, pad_centers: 11, region: 'Central', coordinates: { row: 3, col: 2 } },
  'Kalaburagi': { population: 2564326, anemia_rate: 63.8, health_score: 36.2, health_centers: 94, pad_centers: 21, region: 'North', coordinates: { row: 2, col: 6 } },
  'Kodagu': { population: 554762, anemia_rate: 51.3, health_score: 48.7, health_centers: 35, pad_centers: 7, region: 'South', coordinates: { row: 6, col: 2 } },
  'Kolar': { population: 1536401, anemia_rate: 59.1, health_score: 40.9, health_centers: 52, pad_centers: 11, region: 'South', coordinates: { row: 5, col: 6 } },
  'Koppal': { population: 1389920, anemia_rate: 64.5, health_score: 35.5, health_centers: 47, pad_centers: 9, region: 'Central', coordinates: { row: 3, col: 3 } },
  'Mandya': { population: 1805769, anemia_rate: 58.7, health_score: 41.3, health_centers: 71, pad_centers: 15, region: 'South', coordinates: { row: 5, col: 4 } },
  'Mysuru': { population: 3001127, anemia_rate: 54.2, health_score: 45.8, health_centers: 145, pad_centers: 32, region: 'South', coordinates: { row: 7, col: 4 } },
  'Raichur': { population: 1924812, anemia_rate: 66.2, health_score: 33.8, health_centers: 63, pad_centers: 13, region: 'Central', coordinates: { row: 3, col: 5 } },
  'Ramanagara': { population: 1082636, anemia_rate: 59.4, health_score: 40.6, health_centers: 46, pad_centers: 10, region: 'South', coordinates: { row: 6, col: 3 } },
  'Shivamogga': { population: 1752753, anemia_rate: 57.8, health_score: 42.2, health_centers: 82, pad_centers: 17, region: 'Central', coordinates: { row: 4, col: 2 } },
  'Tumakuru': { population: 2678980, anemia_rate: 60.2, health_score: 39.8, health_centers: 108, pad_centers: 24, region: 'South', coordinates: { row: 4, col: 5 } },
  'Udupi': { population: 1177361, anemia_rate: 49.5, health_score: 50.5, health_centers: 66, pad_centers: 16, region: 'Coastal', coordinates: { row: 5, col: 1 } },
  'Uttara Kannada': { population: 1437169, anemia_rate: 56.8, health_score: 43.2, health_centers: 59, pad_centers: 12, region: 'Coastal', coordinates: { row: 2, col: 1 } },
  'Vijayanagara': { population: 1256000, anemia_rate: 62.9, health_score: 37.1, health_centers: 51, pad_centers: 10, region: 'Central', coordinates: { row: 3, col: 3 } },
  'Yadgir': { population: 1174985, anemia_rate: 67.1, health_score: 32.9, health_centers: 38, pad_centers: 8, region: 'Central', coordinates: { row: 3, col: 6 } }
};

// Function to determine zone color based on health score
const getZoneColor = (healthScore) => {
  if (healthScore >= 50) return { bg: '#2ecc71', label: 'Safe Zone', gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)' };
  if (healthScore >= 40) return { bg: '#f39c12', label: 'Medium Zone', gradient: 'linear-gradient(135deg, #f39c12, #e67e22)' };
  return { bg: '#e74c3c', label: 'Critical Zone', gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)' };
};

const KarnatakaMap = ({ selectedDistrict, onDistrictSelect }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Create a 8x7 grid map of Karnataka
  const createMapGrid = () => {
    const grid = Array(9).fill().map(() => Array(7).fill(null));
    
    // Place districts on the grid based on their coordinates
    Object.entries(districtData).forEach(([name, data]) => {
      const { row, col } = data.coordinates;
      if (grid[row] && grid[row][col]) {
        // If multiple districts share same cell, make it an array
        if (!Array.isArray(grid[row][col])) {
          grid[row][col] = [grid[row][col]];
        }
        grid[row][col].push(name);
      } else {
        grid[row][col] = name;
      }
    });
    
    return grid;
  };

  const mapGrid = createMapGrid();

  const filteredDistricts = Object.keys(districtData).filter(district =>
    district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDistrictColorClass = (healthScore) => {
    if (healthScore >= 50) return 'safe-zone';
    if (healthScore >= 40) return 'medium-zone';
    return 'critical-zone';
  };

  return (
    <div className="karnataka-map-container">
      <div className="map-header">
        <h3>🗺️ Karnataka Health Map</h3>
        <p>Visual representation of health status across 31 districts</p>
        <div className="zone-legend">
          <div className="legend-item">
            <div className="legend-color safe"></div>
            <span>Safe Zone (≥50%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>Medium Zone (40-49%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color critical"></div>
            <span>Critical Zone ( {'<'} 40%)</span>
          </div>
        </div>
      </div>

      <div className="map-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search district..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="region-stats">
          <div className="region-stat north">North Karnataka</div>
          <div className="region-stat central">Central Karnataka</div>
          <div className="region-stat south">South Karnataka</div>
          <div className="region-stat coastal">Coastal Karnataka</div>
        </div>
      </div>

      {/* Visual Map Grid */}
      <div className="visual-map">
        <div className="map-grid-container">
          {mapGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="map-row">
              {row.map((cell, colIndex) => {
                if (!cell) {
                  return <div key={`${rowIndex}-${colIndex}`} className="map-cell empty"></div>;
                }
                
                const districts = Array.isArray(cell) ? cell : [cell];
                const hasHighlighted = districts.some(d => 
                  filteredDistricts.includes(d) && searchTerm !== ''
                );
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className={`map-cell ${hasHighlighted ? 'highlighted' : ''}`}
                  >
                    {districts.map(district => {
                      const data = districtData[district];
                      const zone = getZoneColor(data.health_score);
                      const isSelected = selectedDistrict === district;
                      const isHovered = hoveredDistrict === district;
                      
                      return (
                        <div
                          key={district}
                          className={`district-block ${getDistrictColorClass(data.health_score)} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
                          onClick={() => onDistrictSelect(district)}
                          onMouseEnter={() => setHoveredDistrict(district)}
                          onMouseLeave={() => setHoveredDistrict(null)}
                          style={{
                            background: zone.gradient
                          }}
                        >
                          <span className="district-name">{district}</span>
                          <span className="district-score">{Math.round(data.health_score)}%</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedDistrict && districtData[selectedDistrict] && (
        <div className="district-info-card">
          <h4>📊 {selectedDistrict} District - Detailed Health Report</h4>
          <div className="info-grid">
            <div className="info-item">
              <label>Region:</label>
              <span>{districtData[selectedDistrict].region}</span>
            </div>
            <div className="info-item">
              <label>Population:</label>
              <span>{districtData[selectedDistrict].population.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Health Score:</label>
              <span className={getDistrictColorClass(districtData[selectedDistrict].health_score)}>
                {Math.round(districtData[selectedDistrict].health_score)}%
              </span>
            </div>
            <div className="info-item">
              <label>Anemia Rate:</label>
              <span>{districtData[selectedDistrict].anemia_rate}%</span>
            </div>
            <div className="info-item">
              <label>Health Centers:</label>
              <span>{districtData[selectedDistrict].health_centers}</span>
            </div>
            <div className="info-item">
              <label>Pad Distribution Centers:</label>
              <span>{districtData[selectedDistrict].pad_centers}</span>
            </div>
          </div>
          <div className="health-status">
            <div className="status-label">Health Index</div>
            <div className="status-bar">
              <div 
                className={`status-fill ${getDistrictColorClass(districtData[selectedDistrict].health_score)}`}
                style={{ width: `${districtData[selectedDistrict].health_score}%` }}
              ></div>
            </div>
            <p className="health-message">
              {districtData[selectedDistrict].health_score >= 50 
                ? "✅ Good health indicators. Women's health programs are effective in this district."
                : districtData[selectedDistrict].health_score >= 40
                ? "⚠️ Moderate health concerns. Need improvement in healthcare accessibility and awareness."
                : "🔴 Critical health situation. Immediate intervention required for women's health programs."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KarnatakaMap;