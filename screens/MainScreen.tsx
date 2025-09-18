import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { getPostsInRadius, deletePost, deleteExpiredPosts } from '../database/database';
import { getCurrentLocation, startLocationTracking, stopLocationTracking } from '../services/locationService';
import { getUsername } from '../services/storageService';
import { getErrorMessage } from '../services/errorService';
import PostItem from '../components/PostItem';
import CreatePostButton from '../components/CreatePostButton';
import DistanceRangeSelector from '../components/DistanceRangeSelector';
import type { RootStackParamList, PostWithDistance, DistanceRange } from '../types';
import { DISTANCE_RANGES } from '../types';

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
type MainScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface Props {
  navigation: MainScreenNavigationProp;
  route: MainScreenRouteProp;
}

export default function MainScreen({ navigation }: Props) {
  const [posts, setPosts] = useState<PostWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<DistanceRange>(DISTANCE_RANGES[0]);
  const [showRangeSelector, setShowRangeSelector] = useState(false);

  useEffect(() => {
    initializeScreen();
    return () => {
      stopLocationTracking();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      
      // Get username
      const user = await getUsername();
      if (user) {
        setUsername(user);
      }

      // Start location tracking
      await startLocationTracking();
      
      // Load initial posts
      await loadPosts();
    } catch (error) {
      console.error('Error initializing main screen:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const location = await getCurrentLocation();
      if (!location) {
        console.log('No location available');
        return;
      }

      // Delete expired posts first
      await deleteExpiredPosts();

      // Get posts in radius
      const postsInRadius = await getPostsInRadius(
        location.coords.latitude,
        location.coords.longitude,
        selectedRange.value // Use selected range
      );

      setPosts(postsInRadius);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  }, []);

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    }
  };

  const handleCreatePost = () => {
    navigation.navigate('PostCreation');
  };

  const handleRangeChange = (range: DistanceRange) => {
    setSelectedRange(range);
    loadPosts(); // Reload posts with new range
  };

  const handlePostPress = (post: PostWithDistance) => {
    navigation.navigate('Chat', { post });
  };

  const renderPost = ({ item }: { item: PostWithDistance }) => (
    <TouchableOpacity onPress={() => handlePostPress(item)}>
      <PostItem
        post={item}
        onDelete={handleDeletePost}
        isOwnPost={item.username === username}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>กำลังโหลดโพสต์...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Yuni</Text>
        <TouchableOpacity 
          style={styles.rangeButton}
          onPress={() => setShowRangeSelector(true)}
        >
          <Text style={styles.rangeButtonText}>{selectedRange.label}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>ยังไม่มีโพสต์ในรัศมี {selectedRange.label}</Text>
            <Text style={styles.emptySubtext}>ลองเดินไปที่อื่นหรือสร้างโพสต์ใหม่</Text>
          </View>
        }
      />

      <CreatePostButton onPress={handleCreatePost} />
      
      <DistanceRangeSelector
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        visible={showRangeSelector}
        onClose={() => setShowRangeSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  rangeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  postsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});