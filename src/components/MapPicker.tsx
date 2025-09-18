import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

interface MapPickerProps {
  onLocationSelect: (_lat: number, _lng: number) => void;
  onRequestPermission: () => void;
  isPermissionDenied: boolean;
}

export default function MapPicker({ 
  onLocationSelect, 
  onRequestPermission, 
  isPermissionDenied 
}: MapPickerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const handleMapPress = () => {
    if (isPermissionDenied) {
      Alert.alert(
        'ต้องการตำแหน่ง',
        'กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อใช้ฟีเจอร์นี้',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตั้งค่า', onPress: onRequestPermission }
        ]
      );
    } else {
      // For now, use a default location (Bangkok)
      onLocationSelect(13.7563, 100.5018);
    }
  };

  return (
    <View style={[
      styles.container,
      isMobile && styles.mobile,
      isTablet && styles.tablet,
      isDesktop && styles.desktop
    ]}>
      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={handleMapPress}
        activeOpacity={0.7}
      >
        <Text style={styles.mapButtonText}>
          {isPermissionDenied ? 'เปิดการตั้งค่าตำแหน่ง' : 'เลือกตำแหน่งบนแผนที่'}
        </Text>
        <Text style={styles.mapButtonSubtext}>
          กดเพื่อเลือกตำแหน่งที่ต้องการ
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  mobile: {
    padding: 20,
  },
  tablet: {
    padding: 40,
  },
  desktop: {
    padding: 60,
  },
  mapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});
