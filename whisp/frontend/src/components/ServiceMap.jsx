import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { NEARBY_SERVICES } from '../data/districts.js';

const ICON = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ServiceMap({ center, districtName }) {
  const markers = useMemo(() => {
    return NEARBY_SERVICES.map((s, i) => {
      const jitter = 0.04;
      const lat = center[0] + (Math.sin(i * 1.7) * jitter) / 2;
      const lng = center[1] + (Math.cos(i * 1.3) * jitter) / 2;
      return { ...s, lat, lng };
    });
  }, [center]);

  return (
    <div className="h-64 w-full overflow-hidden rounded-card border border-slate-200 shadow-inner">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: '16rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={ICON}>
          <Popup>{districtName} district centroid</Popup>
        </Marker>
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={ICON}>
            <Popup>
              <strong>{m.name}</strong>
              <br />
              {m.dist} · {m.hours}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
