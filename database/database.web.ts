// Web-specific database implementation using Firebase Realtime Database
import type { Post, CreatePostData, User, CreateUserData, QueryResult, AppError } from '../types';
import { ErrorCode } from '../types';
import { createAppError } from '../services/errorService';
import { validateCreatePostData, validateCreateUserData } from '../services/validationService';
import { getDatabase, ref, push, set, get, remove, onValue, off } from 'firebase/database';

// Firebase database reference
let database: any = null;

// Initialize database (web version)
export const initDatabase = async (): Promise<void> => {
  try {
    // Import Firebase app and get database
    const { initializeApp } = await import('firebase/app');
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
    
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log('Web database initialized successfully with Firebase');
  } catch (error) {
    console.error('Error initializing web database:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to initialize database');
  }
};

// Get all posts from localStorage
const getPosts = (): Post[] => {
  try {
    const postsJson = localStorage.getItem(POSTS_KEY);
    return postsJson ? JSON.parse(postsJson) : [];
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

// Save posts to localStorage
const savePosts = (posts: Post[]): void => {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to save posts');
  }
};

// Add a new post - Use localStorage for speed
export const addPost = async (postData: CreatePostData): Promise<string> => {
  try {
    const validation = validateCreatePostData(postData);
    if (!validation.isValid) {
      throw createAppError(ErrorCode.VALIDATION_ERROR, validation.errors[0]?.message || 'Invalid post data');
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // หมดอายุใน 24 ชั่วโมง

    const newPost: any = {
      id: Date.now().toString(), // Simple ID generation
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

    // Save to localStorage for immediate display
    const postsJson = localStorage.getItem('yuni_posts');
    const posts: Post[] = postsJson ? JSON.parse(postsJson) : [];
    posts.push(newPost);
    localStorage.setItem('yuni_posts', JSON.stringify(posts));
    console.log('Post saved to localStorage:', newPost);
    
    // Try to save to Firebase (but don't fail if it doesn't work)
    try {
      const postsRef = ref(database, 'posts');
      const newPostRef = push(postsRef);
      newPost.id = newPostRef.key || '';
      
      await set(newPostRef, newPost);
      console.log('Post also saved to Firebase:', newPost);
    } catch (firebaseError) {
      console.log('Firebase save failed, using localStorage only:', firebaseError);
    }
    
    return newPost.id;
  } catch (error) {
    console.error('Error in addPost:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to add post');
  }
};

// Get posts within radius - Use localStorage for sync
export const getPostsInRadius = async (
  latitude: number,
  longitude: number,
  radiusMeters: number
): Promise<Post[]> => {
  try {
    console.log('Loading posts from localStorage for sync...');
    
    // Use localStorage for immediate sync (same as mobile)
    const postsJson = localStorage.getItem('yuni_posts');
    
    if (!postsJson) {
      console.log('No posts found in localStorage');
      return [];
    }

    const posts: Post[] = JSON.parse(postsJson);
    
    console.log(`Raw localStorage data from web:`, posts);
    
    const now = new Date();
    const validPosts = posts.filter(post => {
      const expiresAt = new Date(post.expires_at);
      return expiresAt > now;
    });

    console.log(`Valid posts after expiration filter:`, validPosts);

    const postsWithDistance = validPosts.map(post => {
      const distance = calculateDistance(latitude, longitude, post.latitude, post.longitude);
      return { ...post, distance };
    });

    const postsInRadius = postsWithDistance.filter(post => post.distance <= radiusMeters);
    postsInRadius.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${postsInRadius.length} posts within ${radiusMeters}m radius from localStorage`);
    return postsInRadius;
  } catch (error) {
    console.error('Error in getPostsInRadius:', error);
    return [];
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    if (!database) {
      throw createAppError(ErrorCode.DATABASE_ERROR, 'Database not initialized');
    }

    const postRef = ref(database, `posts/${postId}`);
    await remove(postRef);
    console.log('Post deleted successfully from Firebase');
  } catch (error) {
    console.error('Error deleting post:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to delete post');
  }
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Clean up expired posts
export const cleanupExpiredPosts = async (): Promise<number> => {
  try {
    const posts = getPosts();
    const now = new Date();
    const validPosts = posts.filter(post => {
      const expiresAt = new Date(post.expires_at);
      return expiresAt > now;
    });

    const deletedCount = posts.length - validPosts.length;
    if (deletedCount > 0) {
      savePosts(validPosts);
      console.log(`Cleaned up ${deletedCount} expired posts`);
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired posts:', error);
    return 0;
  }
};

// Delete expired posts (alias for cleanupExpiredPosts)
export const deleteExpiredPosts = async (): Promise<void> => {
  try {
    if (!database) {
      throw createAppError(ErrorCode.DATABASE_ERROR, 'Database not initialized');
    }

    const postsRef = ref(database, 'posts');
    const snapshot = await get(postsRef);
    
    if (!snapshot.exists()) {
      console.log('No posts found in Firebase');
      return;
    }

    const postsData = snapshot.val();
    const now = new Date();
    let deletedCount = 0;

    for (const [postId, post] of Object.entries(postsData)) {
      const postData = post as Post;
      const expiresAt = new Date(postData.expires_at);
      
      if (expiresAt <= now) {
        const postRef = ref(database, `posts/${postId}`);
        await remove(postRef);
        deletedCount++;
      }
    }

    console.log(`Deleted ${deletedCount} expired posts from Firebase`);
  } catch (error) {
    console.error('Error deleting expired posts:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to delete expired posts');
  }
};

// User management functions (simplified for web)
export const addUser = async (userData: CreateUserData): Promise<string> => {
  try {
    const validation = validateCreateUserData(userData);
    if (!validation.isValid) {
      throw createAppError(ErrorCode.VALIDATION_ERROR, validation.errors[0]?.message || 'Invalid user data');
    }

    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const newUser: User = {
      id: Date.now(),
      username: userData.username,
      device_id: 'web-' + Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    console.log('User added successfully:', newUser);
    return newUser.id.toString();
  } catch (error) {
    console.error('Error in addUser:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to add user');
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    return users.find(user => user.username === username) || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};
