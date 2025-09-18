import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

// ฟังก์ชันสำหรับขอ permission camera
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับขอ permission photo library
export const requestPhotoLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting photo library permission:', error);
    return false;
  }
};

// ฟังก์ชันสำหรับถ่ายรูป
export const takePhoto = async (): Promise<{ uri: string; width: number; height: number } | null> => {
  try {
    // ตรวจสอบ permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      console.log('Camera permission denied');
      return null;
    }

    // ถ่ายรูป
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      console.log('Camera cancelled');
      return null;
    }

    // Compress รูปภาพ
    const compressedImage = await compressImage(result.assets[0].uri);
    console.log('Camera result:', {
      originalUri: result.assets[0].uri,
      compressedUri: compressedImage,
      width: result.assets[0].width,
      height: result.assets[0].height
    });
    return {
      uri: compressedImage,
      width: result.assets[0].width,
      height: result.assets[0].height
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับเลือกรูปจาก gallery
export const pickImageFromGallery = async (): Promise<{ uri: string; width: number; height: number } | null> => {
  try {
    // ตรวจสอบ permission
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      console.log('Photo library permission denied');
      return null;
    }

    // เลือกรูป
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      console.log('Image picker cancelled');
      return null;
    }

    // Compress รูปภาพ
    const compressedImage = await compressImage(result.assets[0].uri);
    console.log('Gallery result:', {
      originalUri: result.assets[0].uri,
      compressedUri: compressedImage,
      width: result.assets[0].width,
      height: result.assets[0].height
    });
    return {
      uri: compressedImage,
      width: result.assets[0].width,
      height: result.assets[0].height
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับ compress รูปภาพ
export const compressImage = async (imageUri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 800,
            height: 600,
          },
        },
      ],
      {
        compress: 0.7, // Compress 70%
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('Image compressed successfully');
    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return imageUri; // Return original if compression fails
  }
};

// ฟังก์ชันสำหรับแสดงตัวเลือกเลือกรูป
export const showImagePicker = async (): Promise<string | null> => {
  try {
    // แสดง action sheet สำหรับเลือกรูป
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      console.log('Image picker cancelled');
      return null;
    }

    // Compress รูปภาพ
    const compressedImage = await compressImage(result.assets[0].uri);
    return compressedImage;
  } catch (error) {
    console.error('Error showing image picker:', error);
    return null;
  }
};

// ฟังก์ชันสำหรับตรวจสอบขนาดไฟล์
export const getImageSize = async (imageUri: string): Promise<number> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return blob.size;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
};

// ฟังก์ชันสำหรับตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
export const isImageFile = (uri: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const lowerUri = uri.toLowerCase();
  return imageExtensions.some(ext => lowerUri.includes(ext));
};

// ฟังก์ชันสำหรับแสดงข้อความ error
export const getImageErrorMessage = (error: any): string => {
  if (error.code === 'E_CAMERA_PERMISSION_DENIED') {
    return 'ไม่มีสิทธิ์เข้าถึงกล้อง กรุณาอนุญาตในการตั้งค่า';
  } else if (error.code === 'E_PHOTO_LIBRARY_PERMISSION_DENIED') {
    return 'ไม่มีสิทธิ์เข้าถึงคลังรูปภาพ กรุณาอนุญาตในการตั้งค่า';
  } else if (error.code === 'E_IMAGE_PICKER_CANCELLED') {
    return 'การเลือกรูปถูกยกเลิก';
  } else if (error.code === 'E_IMAGE_PICKER_FAILED') {
    return 'ไม่สามารถเลือกรูปได้ กรุณาลองใหม่';
  } else {
    return 'เกิดข้อผิดพลาดในการจัดการรูปภาพ';
  }
};

export default {
  requestCameraPermission,
  requestPhotoLibraryPermission,
  takePhoto,
  pickImageFromGallery,
  compressImage,
  showImagePicker,
  getImageSize,
  isImageFile,
  getImageErrorMessage,
};
