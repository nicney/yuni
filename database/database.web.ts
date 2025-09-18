// Web-specific database implementation using localStorage
import type { Post, CreatePostData, User, CreateUserData, QueryResult, AppError } from '../types';
import { ErrorCode } from '../types';
import { createAppError } from '../services/errorService';
import { validateCreatePostData, validateCreateUserData } from '../services/validationService';

// Web storage keys
const POSTS_KEY = 'yuni_posts';
const USERS_KEY = 'yuni_users';

// Initialize database (web version)
export const initDatabase = async (): Promise<void> => {
  try {
    // Initialize localStorage if not exists
    if (!localStorage.getItem(POSTS_KEY)) {
      localStorage.setItem(POSTS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
    console.log('Web database initialized successfully');
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

// Add a new post
export const addPost = async (postData: CreatePostData): Promise<string> => {
  try {
    const validation = validateCreatePostData(postData);
    if (!validation.isValid) {
      throw createAppError(ErrorCode.VALIDATION_ERROR, validation.errors[0]?.message || 'Invalid post data');
    }

    const posts = getPosts();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 1); // หมดอายุใน 1 นาที

    const newPost: Post = {
      id: Date.now().toString(), // Simple ID generation
      username: postData.username,
      content: postData.content,
      image_uri: postData.image_uri || undefined,
      latitude: postData.latitude,
      longitude: postData.longitude,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      timestamp: Date.now(),
    };

    posts.push(newPost);
    savePosts(posts);

    console.log('Post added successfully:', newPost);
    return newPost.id;
  } catch (error) {
    console.error('Error in addPost:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to add post');
  }
};

// Get posts within radius
export const getPostsInRadius = async (
  latitude: number,
  longitude: number,
  radiusMeters: number
): Promise<Post[]> => {
  try {
    const posts = getPosts();
    const now = new Date();
    const validPosts = posts.filter(post => {
      const expiresAt = new Date(post.expires_at);
      return expiresAt > now;
    });

    const postsWithDistance = validPosts.map(post => {
      const distance = calculateDistance(latitude, longitude, post.latitude, post.longitude);
      return { ...post, distance };
    });

    const postsInRadius = postsWithDistance.filter(post => post.distance <= radiusMeters);
    postsInRadius.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${postsInRadius.length} posts within ${radiusMeters}m radius`);
    return postsInRadius;
  } catch (error) {
    console.error('Error in getPostsInRadius:', error);
    throw createAppError(ErrorCode.DATABASE_ERROR, 'Failed to get posts in radius');
  }
};

// Delete a post
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const posts = getPosts();
    const filteredPosts = posts.filter(post => post.id !== postId);
    savePosts(filteredPosts);
    console.log('Post deleted successfully');
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
