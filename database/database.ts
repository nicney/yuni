import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import type { Post, CreatePostData, User, CreateUserData, QueryResult, AppError } from '../types';
import { ErrorCode } from '../types';
import { createAppError, handleDatabaseError } from '../services/errorService';
import { validateCreatePostData, validateCreateUserData } from '../services/validationService';
import { getDatabase, ref, push, set, get, remove } from 'firebase/database';

// Web fallback using localStorage
const isWeb = Platform.OS === 'web';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjvf37Hq5Hnfe9EZx4yGLwJreWA70RP84",
  authDomain: "plat-6c5a7.firebaseapp.com",
  projectId: "plat-6c5a7",
  storageBucket: "plat-6c5a7.firebasestorage.app",
  messagingSenderId: "1030467310392",
  appId: "1:1030467310392:web:47906f52c5e10ce8c6a7cd",
  measurementId: "G-FR1B9F8YVL",
  databaseURL: "https://plat-6c5a7-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// สร้าง database connection
let db: SQLite.SQLiteDatabase | null = null;
let firebaseDb: any = null;

// ฟังก์ชันสำหรับเปิด database
const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    if (isWeb) {
      // Web fallback - use in-memory database
      db = await SQLite.openDatabaseAsync(':memory:');
    } else {
      db = await SQLite.openDatabaseAsync('yuni.db');
    }
  }
  return db;
};

// ฟังก์ชันสำหรับสร้างตาราง
export const initDatabase = async (): Promise<void> => {
  try {
    // Initialize Firebase for mobile
    if (!isWeb) {
      const { initializeApp } = await import('firebase/app');
      const app = initializeApp(firebaseConfig);
      firebaseDb = getDatabase(app);
      console.log('Mobile database initialized with Firebase');
      return;
    }
    
    const database = await openDatabase();
    
    // สร้างตาราง posts
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        image_uri TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL
      );
    `);

    // สร้างตาราง users
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        device_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // สร้าง indexes
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(latitude, longitude);
    `);
    
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_posts_expires ON posts(expires_at);
    `);
    
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_users_device ON users(device_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับเพิ่มโพสต์
export const addPost = async (postData: CreatePostData): Promise<number> => {
  try {
    // ตรวจสอบข้อมูลก่อนบันทึก
    const validation = validateCreatePostData(postData);
    if (!validation.isValid) {
      throw createAppError(
        ErrorCode.VALIDATION_ERROR,
        validation.errors.map(e => e.message).join(', ')
      );
    }

    // Use localStorage for mobile (temporary solution)
    if (!isWeb) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // หมดอายุใน 24 ชั่วโมง

      const newPost: any = {
        id: Date.now().toString(),
        username: postData.username,
        content: postData.content,
        latitude: postData.latitude,
        longitude: postData.longitude,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        timestamp: Date.now(),
      };

      // Only add image_uri if it exists
      if (postData.image_uri) {
        newPost.image_uri = postData.image_uri;
      }

      // Save to Firebase first, then AsyncStorage
      try {
        if (firebaseDb) {
          const postsRef = ref(firebaseDb, 'posts');
          const newPostRef = push(postsRef);
          newPost.id = newPostRef.key || newPost.id;
          await set(newPostRef, newPost);
          console.log('Post added successfully to Firebase from mobile:', newPost);
        }
        
        // Also save to AsyncStorage for immediate display
        const { AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const postsJson = await AsyncStorage.getItem('yuni_posts');
        const posts: any[] = postsJson ? JSON.parse(postsJson) : [];
        posts.push(newPost);
        await AsyncStorage.setItem('yuni_posts', JSON.stringify(posts));
        console.log('Post also saved to AsyncStorage for immediate display');
        return Date.now();
      } catch (error) {
        console.log('Firebase/AsyncStorage failed, using SQLite fallback:', error);
        // Fall through to SQLite
      }
    }

    // Use SQLite for web fallback
    const database = await openDatabase();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // หมดอายุใน 24 ชั่วโมง

    const result = await database.runAsync(
      `INSERT INTO posts (username, content, image_uri, latitude, longitude, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [postData.username, postData.content, postData.image_uri || null, postData.latitude, postData.longitude, expiresAt.toISOString()]
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error in addPost:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันสำหรับดึงโพสต์ในรัศมี 100 เมตร
export const getPostsInRadius = async (
  latitude: number,
  longitude: number,
  radiusMeters: number = 100
): Promise<any[]> => {
  try {
    // Use Firebase for mobile
    if (!isWeb && firebaseDb) {
      try {
        const postsRef = ref(firebaseDb, 'posts');
        const snapshot = await get(postsRef);
        
        if (!snapshot.exists()) {
          console.log('No posts found in Firebase from mobile');
          return [];
        }

        const postsData = snapshot.val();
        const posts: any[] = Object.values(postsData);
        
        const now = new Date();
        const validPosts = posts.filter(post => {
          const expiresAt = new Date(post.expires_at);
          return expiresAt > now;
        });

        // กรองโพสต์ที่อยู่ในรัศมี
        const nearbyPosts = validPosts.filter((post: any) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            post.latitude,
            post.longitude
          );
          return distance <= radiusMeters;
        });

        console.log(`Found ${nearbyPosts.length} posts within ${radiusMeters}m radius from Firebase (mobile)`);
        return nearbyPosts;
      } catch (error) {
        console.log('Firebase failed, using SQLite fallback:', error);
        // Fall through to SQLite
      }
    }
    
    // Use SQLite for web fallback
    const database = await openDatabase();
    
    const result = await database.getAllAsync(
      `SELECT * FROM posts 
       WHERE expires_at > datetime('now') 
       ORDER BY created_at DESC`
    );
    
    // กรองโพสต์ที่อยู่ในรัศมี 100 เมตร
    const nearbyPosts = result.filter((post: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        post.latitude,
        post.longitude
      );
      return distance <= radiusMeters;
    });
    
    return nearbyPosts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันสำหรับลบโพสต์ที่หมดอายุ
export const deleteExpiredPosts = async (): Promise<void> => {
  try {
    const database = await openDatabase();
    
    const result = await database.runAsync(
      `DELETE FROM posts WHERE expires_at <= datetime('now')`
    );
    
    console.log(`Deleted ${result.changes} expired posts`);
  } catch (error) {
    console.error('Error deleting expired posts:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันสำหรับลบโพสต์ตาม ID
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const database = await openDatabase();
    
    await database.runAsync(
      `DELETE FROM posts WHERE id = ?`,
      [postId]
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันสำหรับเพิ่มผู้ใช้
export const addUser = async (userData: CreateUserData): Promise<number> => {
  try {
    // ตรวจสอบข้อมูลก่อนบันทึก
    const validation = validateCreateUserData(userData);
    if (!validation.isValid) {
      throw createAppError(
        ErrorCode.VALIDATION_ERROR,
        validation.errors.map(e => e.message).join(', ')
      );
    }

    const database = await openDatabase();
    
    const result = await database.runAsync(
      `INSERT OR REPLACE INTO users (username, device_id) VALUES (?, ?)`,
      [userData.username, userData.device_id]
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error in addUser:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
export const getUser = async (deviceId: string): Promise<any> => {
  try {
    const database = await openDatabase();
    
    const result = await database.getFirstAsync(
      `SELECT * FROM users WHERE device_id = ?`,
      [deviceId]
    );
    
    return result;
  } catch (error) {
    console.error('Error getting user:', error);
    throw handleDatabaseError(error);
  }
};

// ฟังก์ชันคำนวณระยะทางระหว่าง 2 จุด (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // รัศมีโลกในหน่วยเมตร
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // ระยะทางในหน่วยเมตร
  return distance;
};

export default openDatabase;
