import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useResponsive } from '../hooks/useResponsive';

interface MapPickerWebProps {
  onLocationSelect: (_lat: number, _lng: number) => void;
  onRequestPermission: () => void;
  isPermissionDenied: boolean;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (_lat: number, _lng: number) => void }) {
  useMapEvents({
    click: (e: any) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

export default function MapPickerWeb({ 
  onLocationSelect, 
  onRequestPermission: _onRequestPermission, 
  isPermissionDenied: _isPermissionDenied 
}: MapPickerWebProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    // Try to get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition(L.latLng(latitude, longitude));
        },
        () => {
          // Fallback to Bangkok if geolocation fails
          setPosition(L.latLng(13.7563, 100.5018));
        }
      );
    } else {
      // Fallback to Bangkok
      setPosition(L.latLng(13.7563, 100.5018));
    }
  }, []);

  if (!position) {
    return (
      <View style={styles.loading}>
        <div>กำลังโหลดแผนที่...</div>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isMobile && styles.mobile,
      isTablet && styles.tablet,
      isDesktop && styles.desktop
    ]}>
      <MapContainer
        center={position as any}
        zoom={isMobile ? 12 : isTablet ? 14 : 16}
        style={styles.map}
        zoomControl={!isMobile}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        {position && (
          <Marker position={position}>
            <div style={styles.marker}>
              <div style={styles.markerInner} />
            </div>
          </Marker>
        )}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  mobile: {
    height: 300,
  },
  tablet: {
    height: 400,
  },
  desktop: {
    height: 500,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
