import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, CreateUserData, AppError } from '../types';
import { ErrorCode } from '../types';
import { createAppError, handleDatabaseError } from './errorService';
import { validateCreateUserData } from './validationService';

// ===== STORAGE SERVICE =====
// จัดการข้อมูลที่เก็บใน AsyncStorage

// Keys สำหรับ AsyncStorage
const STORAGE_KEYS = {
  USER: 'yuni_user',
  USERNAME: 'yuni_username',
  DEVICE_ID: 'yuni_device_id',
  FIRST_LAUNCH: 'yuni_first_launch',
  LOCATION_PERMISSION: 'yuni_location_permission',
  CAMERA_PERMISSION: 'yuni_camera_permission',
  PHOTO_LIBRARY_PERMISSION: 'yuni_photo_library_permission'
};

// ฟังก์ชันสำหรับสร้าง device ID
export const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `device_${timestamp}_${random}`;
};

// ฟังก์ชันสำหรับบันทึกข้อมูลผู้ใช้
export const saveUser = async (userData: CreateUserData): Promise<void> => {
  try {
    // ตรวจสอบข้อมูลก่อนบันทึก
    const validation = validateCreateUserData(userData);
    if (!validation.isValid) {
      throw createAppError(
        ErrorCode.VALIDATION_ERROR,
        validation.errors.map(e => e.message).join(', ')
      );
    }

    // บันทึกข้อมูลผู้ใช้
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, userData.username);
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, userData.device_id);
    
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    if (!userData) {
      return null;
    }

    const parsedUser = JSON.parse(userData);
    return {
      id: 0, // จะได้จาก database
      username: parsedUser.username,
      device_id: parsedUser.device_id,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    throw createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'ไม่สามารถดึงข้อมูลผู้ใช้ได้'
    );
  }
};

// ฟังก์ชันสำหรับดึง username
export const getUsername = async (): Promise<string | null> => {
  try {
    const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
    return username;
  } catch (error) {
    console.error('Error getting username:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับดึง device ID
export const getDeviceId = async (): Promise<string | null> => {
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    
    // ถ้าไม่มี device ID ให้สร้างใหม่
    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าเป็น first launch หรือไม่
export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
    return firstLaunch === null;
  } catch (error) {
    console.error('Error checking first launch:', error);
    return true; // ถ้า error ให้ถือว่าเป็น first launch
  }
};

// ฟังก์ชันสำหรับตั้งค่า first launch
export const setFirstLaunch = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
  } catch (error) {
    console.error('Error setting first launch:', error);
  }
};

// ฟังก์ชันสำหรับบันทึก permission status
export const savePermissionStatus = async (permission: string, status: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(permission, status.toString());
  } catch (error) {
    console.error('Error saving permission status:', error);
  }
};

// ฟังก์ชันสำหรับดึง permission status
export const getPermissionStatus = async (permission: string): Promise<boolean> => {
  try {
    const status = await AsyncStorage.getItem(permission);
    return status === 'true';
  } catch (error) {
    console.error('Error getting permission status:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับลบข้อมูลผู้ใช้
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.USERNAME,
      STORAGE_KEYS.DEVICE_ID
    ]);
    console.log('User data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'ไม่สามารถลบข้อมูลผู้ใช้ได้'
    );
  }
};

// ฟังก์ชันสำหรับลบข้อมูลทั้งหมด
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'ไม่สามารถลบข้อมูลทั้งหมดได้'
    );
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่า user มีข้อมูลหรือไม่
export const hasUserData = async (): Promise<boolean> => {
  try {
    const username = await getUsername();
    const deviceId = await getDeviceId();
    return username !== null && deviceId !== null;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับอัพเดท username
export const updateUsername = async (newUsername: string): Promise<void> => {
  try {
    // ตรวจสอบ username
    const validation = validateCreateUserData({ username: newUsername, device_id: 'temp' });
    if (!validation.isValid) {
      throw createAppError(
        ErrorCode.VALIDATION_ERROR,
        validation.errors.map(e => e.message).join(', ')
      );
    }

    // อัพเดท username
    await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, newUsername);
    
    // อัพเดทข้อมูลผู้ใช้ทั้งหมด
    const deviceId = await getDeviceId();
    if (deviceId) {
      await saveUser({ username: newUsername, device_id: deviceId });
    }
    
    console.log('Username updated successfully');
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมด
export const getAllData = async (): Promise<Record<string, any>> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error getting all data:', error);
    return {};
  }
};

// ฟังก์ชันสำหรับตรวจสอบ storage space
export const getStorageInfo = async (): Promise<{ used: number; available: number }> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let used = 0;
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        used += value.length;
      }
    }
    
    return {
      used,
      available: 0 // ไม่สามารถตรวจสอบได้ใน AsyncStorage
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { used: 0, available: 0 };
  }
};

export default {
  generateDeviceId,
  saveUser,
  getUser,
  getUsername,
  getDeviceId,
  isFirstLaunch,
  setFirstLaunch,
  savePermissionStatus,
  getPermissionStatus,
  clearUserData,
  clearAllData,
  hasUserData,
  updateUsername,
  getAllData,
  getStorageInfo
};
