import type { ValidationRule, ValidationResult, ValidationError, CreatePostData, CreateUserData } from '../types';
import { MAX_POST_CONTENT_LENGTH } from '../types';

// ===== VALIDATION SERVICE =====
// ตรวจสอบความถูกต้องของข้อมูลทุกประเภท

// ฟังก์ชันสำหรับตรวจสอบ username
export const validateUsername = (username: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // ตรวจสอบว่าไม่ว่าง
  if (!username || username.trim().length === 0) {
    errors.push({
      field: 'username',
      message: 'กรุณากรอกชื่อผู้ใช้',
      value: username
    });
    return { isValid: false, errors };
  }
  
  // ตรวจสอบความยาว
  if (username.length < 2) {
    errors.push({
      field: 'username',
      message: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 2 ตัวอักษร',
      value: username
    });
  }
  
  if (username.length > 20) {
    errors.push({
      field: 'username',
      message: 'ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร',
      value: username
    });
  }
  
  // ตรวจสอบรูปแบบ (เฉพาะตัวอักษร, ตัวเลข, และ _)
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  if (!usernamePattern.test(username)) {
    errors.push({
      field: 'username',
      message: 'ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษร, ตัวเลข, และ _ เท่านั้น',
      value: username
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบ post content
export const validatePostContent = (content: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // ตรวจสอบว่าไม่ว่าง
  if (!content || content.trim().length === 0) {
    errors.push({
      field: 'content',
      message: 'กรุณากรอกข้อความโพสต์',
      value: content
    });
    return { isValid: false, errors };
  }
  
  // ตรวจสอบความยาว
  if (content.length > MAX_POST_CONTENT_LENGTH) {
    errors.push({
      field: 'content',
      message: `ข้อความโพสต์ต้องไม่เกิน ${MAX_POST_CONTENT_LENGTH} ตัวอักษร`,
      value: content
    });
  }
  
  // ตรวจสอบว่ามีข้อความที่เหมาะสมหรือไม่
  const inappropriateWords = ['spam', 'scam', 'fake'];
  const lowerContent = content.toLowerCase();
  for (const word of inappropriateWords) {
    if (lowerContent.includes(word)) {
      errors.push({
        field: 'content',
        message: 'ข้อความโพสต์มีคำที่ไม่เหมาะสม',
        value: content
      });
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบ location
export const validateLocation = (latitude: number, longitude: number): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // ตรวจสอบ latitude
  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    errors.push({
      field: 'latitude',
      message: 'ค่าละติจูดไม่ถูกต้อง (ต้องอยู่ระหว่าง -90 ถึง 90)',
      value: latitude
    });
  }
  
  // ตรวจสอบ longitude
  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    errors.push({
      field: 'longitude',
      message: 'ค่าลองจิจูดไม่ถูกต้อง (ต้องอยู่ระหว่าง -180 ถึง 180)',
      value: longitude
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบ image URI
export const validateImageUri = (imageUri: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  console.log('Validating image URI:', imageUri);
  
  // ตรวจสอบว่าไม่ว่าง
  if (!imageUri || imageUri.trim().length === 0) {
    errors.push({
      field: 'imageUri',
      message: 'กรุณาเลือกรูปภาพ',
      value: imageUri
    });
    return { isValid: false, errors };
  }
  
  // ตรวจสอบรูปแบบ URI (รองรับ Android/iOS URI formats)
  // Android: content://, file://, data:image/
  // iOS: file://, ph://
  const uriPattern = /^(https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)|file:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)|content:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)|data:image\/(jpg|jpeg|png|gif|bmp|webp)|ph:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp))$/i;
  
  // Fallback: ตรวจสอบแค่ file extension ถ้า URI pattern ไม่ผ่าน
  const hasImageExtension = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(imageUri);
  
  if (!uriPattern.test(imageUri) && !hasImageExtension) {
    console.log('Image URI validation failed:', {
      uri: imageUri,
      pattern: uriPattern.toString(),
      uriType: typeof imageUri,
      uriLength: imageUri.length,
      hasImageExtension
    });
    errors.push({
      field: 'imageUri',
      message: 'รูปแบบไฟล์รูปภาพไม่ถูกต้อง',
      value: imageUri
    });
  } else {
    console.log('Image URI validation passed:', {
      uri: imageUri,
      patternMatch: uriPattern.test(imageUri),
      extensionMatch: hasImageExtension
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบ CreatePostData
export const validateCreatePostData = (data: CreatePostData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // ตรวจสอบ username
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  }
  
  // ตรวจสอบ content
  const contentValidation = validatePostContent(data.content);
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  }
  
  // ตรวจสอบ location
  const locationValidation = validateLocation(data.latitude, data.longitude);
  if (!locationValidation.isValid) {
    errors.push(...locationValidation.errors);
  }
  
  // ตรวจสอบ image (ถ้ามี)
  if (data.image_uri) {
    const imageValidation = validateImageUri(data.image_uri);
    if (!imageValidation.isValid) {
      errors.push(...imageValidation.errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบ CreateUserData
export const validateCreateUserData = (data: CreateUserData): ValidationResult => {
  const errors: ValidationError[] = [];
  
  // ตรวจสอบ username
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  }
  
  // ตรวจสอบ device_id
  if (!data.device_id || data.device_id.trim().length === 0) {
    errors.push({
      field: 'device_id',
      message: 'Device ID ไม่ถูกต้อง',
      value: data.device_id
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับตรวจสอบตาม rules
export const validateByRules = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: ValidationError[] = [];
  
  for (const rule of rules) {
    // ตรวจสอบ required
    if (rule.required && (!value || value.toString().trim().length === 0)) {
      errors.push({
        field: rule.field,
        message: rule.message,
        value
      });
      continue;
    }
    
    // ตรวจสอบ minLength
    if (rule.minLength && value && value.toString().length < rule.minLength) {
      errors.push({
        field: rule.field,
        message: rule.message,
        value
      });
      continue;
    }
    
    // ตรวจสอบ maxLength
    if (rule.maxLength && value && value.toString().length > rule.maxLength) {
      errors.push({
        field: rule.field,
        message: rule.message,
        value
      });
      continue;
    }
    
    // ตรวจสอบ pattern
    if (rule.pattern && value && !rule.pattern.test(value.toString())) {
      errors.push({
        field: rule.field,
        message: rule.message,
        value
      });
      continue;
    }
    
    // ตรวจสอบ custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push({
        field: rule.field,
        message: rule.message,
        value
      });
      continue;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ฟังก์ชันสำหรับสร้าง validation rules
export const createValidationRules = (): ValidationRule[] => {
  return [
    {
      field: 'username',
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      message: 'ชื่อผู้ใช้ต้องมี 2-20 ตัวอักษร และใช้ได้เฉพาะตัวอักษร, ตัวเลข, และ _'
    },
    {
      field: 'content',
      required: true,
      maxLength: MAX_POST_CONTENT_LENGTH,
      message: `ข้อความโพสต์ต้องไม่เกิน ${MAX_POST_CONTENT_LENGTH} ตัวอักษร`
    },
    {
      field: 'latitude',
      required: true,
      custom: (value) => !isNaN(value) && value >= -90 && value <= 90,
      message: 'ค่าละติจูดต้องอยู่ระหว่าง -90 ถึง 90'
    },
    {
      field: 'longitude',
      required: true,
      custom: (value) => !isNaN(value) && value >= -180 && value <= 180,
      message: 'ค่าลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180'
    }
  ];
};

// ฟังก์ชันสำหรับตรวจสอบว่า string เป็น email หรือไม่
export const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// ฟังก์ชันสำหรับตรวจสอบว่า string เป็น phone number หรือไม่
export const isValidPhoneNumber = (phone: string): boolean => {
  const phonePattern = /^[0-9]{10,15}$/;
  return phonePattern.test(phone.replace(/\s/g, ''));
};

// ฟังก์ชันสำหรับตรวจสอบว่า string เป็น URL หรือไม่
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ฟังก์ชันสำหรับ sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // ลบ HTML tags
    .replace(/['"]/g, '') // ลบ quotes
    .replace(/[;]/g, '') // ลบ semicolons
    .substring(0, 1000); // จำกัดความยาว
};

export default {
  validateUsername,
  validatePostContent,
  validateLocation,
  validateImageUri,
  validateCreatePostData,
  validateCreateUserData,
  validateByRules,
  createValidationRules,
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
  sanitizeInput
};
