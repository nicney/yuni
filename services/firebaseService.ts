import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, set, remove } from 'firebase/database';
import type { ChatMessage } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjvf37Hq5Hnfe9EZx4yGLwJreWA70RP84",
  authDomain: "plat-6c5a7.firebaseapp.com",
  projectId: "plat-6c5a7",
  storageBucket: "plat-6c5a7.firebasestorage.app",
  messagingSenderId: "1030467310392",
  appId: "1:1030467310392:web:47906f52c5e10ce8c6a7cd",
  measurementId: "G-FR1B9F8YVL",
  databaseURL: "https://plat-6c5a7-default-rtdb.asia-southeast1.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ===== CHAT SERVICE =====

// ฟังก์ชันสำหรับส่งข้อความในโพสต์
export const sendChatMessage = async (
  postId: string,
  message: string,
  username: string
): Promise<void> => {
  try {
    const messagesRef = ref(database, `posts/${postId}/messages`);
    const newMessageRef = push(messagesRef);
    
    const messageData: ChatMessage = {
      id: newMessageRef.key || '',
      postId,
      message,
      username,
      timestamp: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    await set(newMessageRef, messageData);
    console.log('Message sent successfully to Firebase:', messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับฟังข้อความใหม่ในโพสต์
export const listenToChatMessages = (
  postId: string,
  onMessage: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = ref(database, `posts/${postId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val() as ChatMessage;
      messages.push(message);
    });
    
    // เรียงตาม timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    onMessage(messages);
  });
  
  return unsubscribe;
};

// ฟังก์ชันสำหรับลบข้อความ
export const deleteChatMessage = async (
  postId: string,
  messageId: string
): Promise<void> => {
  try {
    const messageRef = ref(database, `posts/${postId}/messages/${messageId}`);
    await remove(messageRef);
    
    console.log('Message deleted successfully from Firebase');
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// ===== POST SERVICE =====
// Note: Post functions are handled by SQLite database service
// This file only handles chat functionality

export default {
  sendChatMessage,
  listenToChatMessages,
  deleteChatMessage
};
