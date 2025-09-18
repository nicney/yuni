import type { AppError, ValidationError } from '../types';
import { ErrorCode } from '../types';

// ===== ERROR HANDLING SERVICE =====
// จัดการ errors ทุกประเภทในแอพ

// ฟังก์ชันสำหรับสร้าง AppError
export const createAppError = (
  code: ErrorCode,
  message: string,
  details?: any
): AppError => {
  return {
    code,
    message,
    details,
    timestamp: Date.now()
  };
};

// ฟังก์ชันสำหรับสร้าง ValidationError
export const createValidationError = (
  field: string,
  message: string,
  value?: any
): ValidationError => {
  return {
    field,
    message,
    value
  };
};

// ฟังก์ชันสำหรับแปลง error เป็นข้อความภาษาไทย
export const getErrorMessage = (error: any): string => {
  // ถ้าเป็น AppError แล้ว
  if (error.code && error.message) {
    return error.message;
  }

  // ถ้าเป็น ValidationError
  if (error.field && error.message) {
    return error.message;
  }

  // ถ้าเป็น native error
  if (error.code) {
    switch (error.code) {
      case 'E_LOCATION_SERVICES_DISABLED':
        return 'GPS ถูกปิดอยู่ กรุณาเปิด GPS';
      case 'E_LOCATION_UNAVAILABLE':
        return 'ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาตรวจสอบการตั้งค่า';
      case 'E_LOCATION_TIMEOUT':
        return 'การดึงตำแหน่งใช้เวลานาน กรุณาลองใหม่';
      case 'E_LOCATION_PERMISSION_DENIED':
        return 'ไม่มีสิทธิ์เข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่า';
      case 'E_CAMERA_PERMISSION_DENIED':
        return 'ไม่มีสิทธิ์เข้าถึงกล้อง กรุณาอนุญาตในการตั้งค่า';
      case 'E_PHOTO_LIBRARY_PERMISSION_DENIED':
        return 'ไม่มีสิทธิ์เข้าถึงคลังรูปภาพ กรุณาอนุญาตในการตั้งค่า';
      case 'E_IMAGE_PICKER_CANCELLED':
        return 'การเลือกรูปถูกยกเลิก';
      case 'E_IMAGE_PICKER_FAILED':
        return 'ไม่สามารถเลือกรูปได้ กรุณาลองใหม่';
      case 'E_NETWORK_ERROR':
        return 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้';
      case 'E_DATABASE_ERROR':
        return 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      case 'E_VALIDATION_ERROR':
        return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      default:
        return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    }
  }

  // ถ้าเป็น string error
  if (typeof error === 'string') {
    return error;
  }

  // ถ้าเป็น object error
  if (error.message) {
    return error.message;
  }

  // Default error message
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

// ฟังก์ชันสำหรับจัดการ location errors
export const handleLocationError = (error: any): AppError => {
  if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
    return createAppError(
      ErrorCode.LOCATION_SERVICES_DISABLED,
      'GPS ถูกปิดอยู่ กรุณาเปิด GPS',
      error
    );
  } else if (error.code === 'E_LOCATION_PERMISSION_DENIED') {
    return createAppError(
      ErrorCode.LOCATION_PERMISSION_DENIED,
      'ไม่มีสิทธิ์เข้าถึงตำแหน่ง กรุณาอนุญาตในการตั้งค่า',
      error
    );
  } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
    return createAppError(
      ErrorCode.LOCATION_SERVICES_DISABLED,
      'ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาตรวจสอบการตั้งค่า',
      error
    );
  } else if (error.code === 'E_LOCATION_TIMEOUT') {
    return createAppError(
      ErrorCode.LOCATION_SERVICES_DISABLED,
      'การดึงตำแหน่งใช้เวลานาน กรุณาลองใหม่',
      error
    );
  } else {
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'เกิดข้อผิดพลาดในการดึงตำแหน่ง',
      error
    );
  }
};

// ฟังก์ชันสำหรับจัดการ image errors
export const handleImageError = (error: any): AppError => {
  if (error.code === 'E_CAMERA_PERMISSION_DENIED') {
    return createAppError(
      ErrorCode.CAMERA_PERMISSION_DENIED,
      'ไม่มีสิทธิ์เข้าถึงกล้อง กรุณาอนุญาตในการตั้งค่า',
      error
    );
  } else if (error.code === 'E_PHOTO_LIBRARY_PERMISSION_DENIED') {
    return createAppError(
      ErrorCode.PHOTO_LIBRARY_PERMISSION_DENIED,
      'ไม่มีสิทธิ์เข้าถึงคลังรูปภาพ กรุณาอนุญาตในการตั้งค่า',
      error
    );
  } else if (error.code === 'E_IMAGE_PICKER_CANCELLED') {
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'การเลือกรูปถูกยกเลิก',
      error
    );
  } else if (error.code === 'E_IMAGE_PICKER_FAILED') {
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'ไม่สามารถเลือกรูปได้ กรุณาลองใหม่',
      error
    );
  } else {
    return createAppError(
      ErrorCode.UNKNOWN_ERROR,
      'เกิดข้อผิดพลาดในการจัดการรูปภาพ',
      error
    );
  }
};

// ฟังก์ชันสำหรับจัดการ database errors
export const handleDatabaseError = (error: any): AppError => {
  return createAppError(
    ErrorCode.DATABASE_ERROR,
    'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
    error
  );
};

// ฟังก์ชันสำหรับจัดการ network errors
export const handleNetworkError = (error: any): AppError => {
  return createAppError(
    ErrorCode.NETWORK_ERROR,
    'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้',
    error
  );
};

// ฟังก์ชันสำหรับจัดการ validation errors
export const handleValidationError = (error: any): AppError => {
  return createAppError(
    ErrorCode.VALIDATION_ERROR,
    'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    error
  );
};

// ฟังก์ชันสำหรับจัดการ unknown errors
export const handleUnknownError = (error: any): AppError => {
  return createAppError(
    ErrorCode.UNKNOWN_ERROR,
    'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
    error
  );
};

// ฟังก์ชันสำหรับ log errors
export const logError = (error: AppError, context?: string): void => {
  console.error(`[${context || 'App'}] Error:`, {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date(error.timestamp).toISOString()
  });
};

// ฟังก์ชันสำหรับแสดง error message ให้ user
export const showErrorToUser = (error: AppError): string => {
  // Log error สำหรับ debugging
  logError(error, 'User Error');
  
  // Return user-friendly message
  return error.message;
};

// ฟังก์ชันสำหรับตรวจสอบว่า error เป็น critical หรือไม่
export const isCriticalError = (error: AppError): boolean => {
  const criticalCodes = [
    ErrorCode.DATABASE_ERROR,
    ErrorCode.LOCATION_SERVICES_DISABLED,
    ErrorCode.NETWORK_ERROR
  ];
  
  return criticalCodes.includes(error.code as ErrorCode);
};

// ฟังก์ชันสำหรับตรวจสอบว่า error สามารถ retry ได้หรือไม่
export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.LOCATION_SERVICES_DISABLED,
    ErrorCode.UNKNOWN_ERROR
  ];
  
  return retryableCodes.includes(error.code as ErrorCode);
};

// ฟังก์ชันสำหรับสร้าง error summary
export const createErrorSummary = (errors: AppError[]): string => {
  if (errors.length === 0) {
    return 'ไม่มีข้อผิดพลาด';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  const criticalErrors = errors.filter(isCriticalError);
  if (criticalErrors.length > 0) {
    return `มีข้อผิดพลาดสำคัญ: ${criticalErrors[0].message}`;
  }
  
  return `มีข้อผิดพลาด ${errors.length} รายการ`;
};

export default {
  createAppError,
  createValidationError,
  getErrorMessage,
  handleLocationError,
  handleImageError,
  handleDatabaseError,
  handleNetworkError,
  handleValidationError,
  handleUnknownError,
  logError,
  showErrorToUser,
  isCriticalError,
  isRetryableError,
  createErrorSummary
};
