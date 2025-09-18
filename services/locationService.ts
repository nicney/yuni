import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

// ฟังก์ชันสำหรับขอ permission
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    // ขอ permission สำหรับ foreground location
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }

    // ขอ permission สำหรับ background location
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('Background location permission denied');
      return false;
    }

    console.log('Location permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับเริ่มต้น location tracking
export const startLocationTracking = async (): Promise<boolean> => {
  try {
    // ตรวจสอบว่า location services เปิดอยู่หรือไม่
    const isLocationEnabled = await Location.hasServicesEnabledAsync();
    if (!isLocationEnabled) {
      console.log('Location services are disabled');
      return false;
    }

    // เริ่มต้น location tracking
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000, // อัพเดททุก 2 วินาที
        distanceInterval: 1, // อัพเดททุก 1 เมตร
      },
      (location) => {
        console.log('Location updated:', location);
        // TODO: Implement location update handling
      }
    );

    console.log('Location tracking started');
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับหยุด location tracking
export const stopLocationTracking = async (): Promise<void> => {
  try {
    // ตรวจสอบว่า task มีอยู่หรือไม่ก่อนหยุด
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Location tracking stopped');
    } else {
      console.log('Location tracking task not found, already stopped');
    }
  } catch (error) {
    console.error('Error stopping location tracking:', error);
  }
};

// ฟังก์ชันสำหรับดึงตำแหน่งปัจจุบัน
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    console.log('Current location:', location);
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่า location services เปิดอยู่หรือไม่
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const isEnabled = await Location.hasServicesEnabledAsync();
    return isEnabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับเปิด location settings
export const openLocationSettings = async (): Promise<void> => {
  try {
    await Location.enableNetworkProviderAsync();
  } catch (error) {
    console.error('Error opening location settings:', error);
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่า GPS เปิดอยู่หรือไม่
export const isGPSEnabled = async (): Promise<boolean> => {
  try {
    const isEnabled = await Location.hasServicesEnabledAsync();
    return isEnabled;
  } catch (error) {
    console.error('Error checking GPS:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่า internet เชื่อมต่ออยู่หรือไม่
export const isInternetConnected = async (): Promise<boolean> => {
  try {
    // ใช้ fetch เพื่อทดสอบการเชื่อมต่อ
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('No internet connection:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับแสดงข้อความ error
export const getErrorMessage = (error: any): string => {
  if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
    return 'GPS ถูกปิดอยู่ กรุณาเปิด GPS';
  } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
    return 'ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาตรวจสอบการตั้งค่า';
  } else if (error.code === 'E_LOCATION_TIMEOUT') {
    return 'การดึงตำแหน่งใช้เวลานาน กรุณาลองใหม่';
  } else if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
    return 'ไม่มีสิทธิ์เข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่า';
  } else {
    return 'เกิดข้อผิดพลาดในการดึงตำแหน่ง';
  }
};

export default {
  requestLocationPermission,
  startLocationTracking,
  stopLocationTracking,
  getCurrentLocation,
  isLocationEnabled,
  openLocationSettings,
  isGPSEnabled,
  isInternetConnected,
  getErrorMessage,
};
