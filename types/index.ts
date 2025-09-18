// Yuni App Type Definitions
// กำหนด types สำหรับทุกส่วนของแอพ

// ===== POST TYPES =====
export interface Post {
  id: string;
  username: string;
  content: string;
  image_uri?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  expires_at: string;
  timestamp: number;
}

export interface CreatePostData {
  username: string;
  content: string;
  image_uri?: string;
  latitude: number;
  longitude: number;
}

export interface PostWithDistance extends Post {
  distance: number; // ระยะทางในหน่วยเมตร
}

// ===== CHAT TYPES =====
export interface ChatMessage {
  id: string;
  postId: string;
  message: string;
  username: string;
  timestamp: number;
  createdAt: string;
}

export interface CreateChatMessageData {
  postId: string;
  message: string;
  username: string;
}

// ===== USER TYPES =====
export interface User {
  id: number;
  username: string;
  device_id: string;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  device_id: string;
}

// ===== LOCATION TYPES =====
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: string;
  message: string;
  details?: any;
}

// ===== IMAGE TYPES =====
export interface ImageData {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ===== UI TYPES =====
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface SuccessState {
  isSuccess: boolean;
  message?: string;
}

// ===== NAVIGATION TYPES =====
export type RootStackParamList = {
  UsernameSetup: undefined;
  Main: undefined;
  PostCreation: undefined;
  PostDetail: { post: Post };
  Chat: { post: Post };
  Settings: undefined;
};

// ===== PERMISSION TYPES =====
export interface PermissionStatus {
  location: boolean;
  camera: boolean;
  photoLibrary: boolean;
  backgroundLocation: boolean;
}

// ===== DATABASE TYPES =====
export interface DatabaseConfig {
  name: string;
  version: number;
  tables: string[];
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  insertId?: number;
}

// ===== BACKGROUND TASK TYPES =====
export interface BackgroundTaskConfig {
  name: string;
  interval: number;
  enabled: boolean;
}

export interface LocationUpdateEvent {
  type: 'location_update';
  data: LocationData;
  timestamp: number;
}

// ===== VALIDATION TYPES =====
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ===== NOTIFICATION TYPES =====
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ===== THEME TYPES =====
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

// ===== UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== CONSTANTS =====
const POST_EXPIRY_MINUTES = 1;
const LOCATION_RADIUS_METERS = 100;
const LOCATION_UPDATE_INTERVAL = 2000; // 2 seconds
const MAX_POST_CONTENT_LENGTH = 250;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const IMAGE_COMPRESSION_QUALITY = 0.7;

// ===== DISTANCE RANGE TYPES =====
export interface DistanceRange {
  value: number;
  label: string;
  unit: 'm' | 'km';
}

const DISTANCE_RANGES: DistanceRange[] = [
  { value: 100, label: '100 เมตร', unit: 'm' },
  { value: 200, label: '200 เมตร', unit: 'm' },
  { value: 300, label: '300 เมตร', unit: 'm' },
  { value: 400, label: '400 เมตร', unit: 'm' },
  { value: 500, label: '500 เมตร', unit: 'm' },
  { value: 1000, label: '1 กิโลเมตร', unit: 'km' }
];

// ===== ENUMS =====
export enum PostStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DELETED = 'deleted'
}

export enum LocationAccuracy {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  HIGHEST = 'highest'
}

export enum ImageSource {
  CAMERA = 'camera',
  GALLERY = 'gallery'
}

export enum ErrorCode {
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  LOCATION_SERVICES_DISABLED = 'LOCATION_SERVICES_DISABLED',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  PHOTO_LIBRARY_PERMISSION_DENIED = 'PHOTO_LIBRARY_PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Export constants
export {
  POST_EXPIRY_MINUTES,
  LOCATION_RADIUS_METERS,
  LOCATION_UPDATE_INTERVAL,
  MAX_POST_CONTENT_LENGTH,
  MAX_IMAGE_SIZE,
  IMAGE_COMPRESSION_QUALITY,
  DISTANCE_RANGES
};
