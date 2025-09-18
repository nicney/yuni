import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import type { PostWithDistance } from '../types';

interface Props {
  post: PostWithDistance;
  onDelete: (postId: string) => void;
  isOwnPost: boolean;
}

export default function PostItem({ post, onDelete, isOwnPost }: Props) {
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} เมตร`;
    } else {
      return `${(distance / 1000).toFixed(1)} กิโลเมตร`;
    }
  };

  const formatTime = (timestamp: string): string => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'เมื่อสักครู่';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} นาทีที่แล้ว`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ชั่วโมงที่แล้ว`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} วันที่แล้ว`;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'ลบโพสต์',
      'คุณแน่ใจหรือไม่ที่จะลบโพสต์นี้?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => onDelete(post.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{post.username}</Text>
            <Text style={styles.time}>{formatTime(post.created_at)}</Text>
          </View>
        </View>
        
        {isOwnPost && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>ลบ</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.postText}>{post.content}</Text>
        
        {post.image_uri && (
          <Image source={{ uri: post.image_uri }} style={styles.postImage} />
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.distanceText}>
          📍 {formatDistance(post.distance)}
        </Text>
        <Text style={styles.expiryText}>
          ⏰ หมดอายุใน {formatTime(post.expires_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  distanceText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
  },
});
