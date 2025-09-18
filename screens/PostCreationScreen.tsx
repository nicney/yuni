import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { addPost } from '../database/database';
import { getCurrentLocation } from '../services/locationService';
import { takePhoto, pickImageFromGallery } from '../services/imageService';
import { getUsername } from '../services/storageService';
import { validatePostContent } from '../services/validationService';
import { getErrorMessage } from '../services/errorService';
import { MAX_POST_CONTENT_LENGTH } from '../types';
import type { RootStackParamList, ImageData } from '../types';

type PostCreationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PostCreation'>;
type PostCreationScreenRouteProp = RouteProp<RootStackParamList, 'PostCreation'>;

interface Props {
  navigation: PostCreationScreenNavigationProp;
  route: PostCreationScreenRouteProp;
}

export default function PostCreationScreen({ navigation }: Props) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    loadUsername();
  }, []);

  const loadUsername = async () => {
    try {
      const user = await getUsername();
      if (user) {
        setUsername(user);
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto();
      if (result) {
        console.log('Photo taken successfully:', result);
        setImage(result);
      } else {
        console.log('Photo was cancelled or failed');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImageFromGallery();
      if (result) {
        console.log('Image picked successfully:', result);
        setImage(result);
      } else {
        console.log('Image picker was cancelled or failed');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate content
      const validation = validatePostContent(content);
      if (!validation.isValid) {
        Alert.alert('ข้อผิดพลาด', validation.errors[0]?.message || 'ข้อมูลไม่ถูกต้อง');
        return;
      }

      // Get current location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเข้าถึงตำแหน่งได้');
        return;
      }

      // Create post data
      const postData = {
        username,
        content: content.trim(),
        image_uri: image?.uri,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log('Creating post with data:', {
        username: postData.username,
        content: postData.content,
        image_uri: postData.image_uri,
        latitude: postData.latitude,
        longitude: postData.longitude
      });

      // Add post to database
      await addPost(postData);

      // Navigate back to main screen
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButton}>ยกเลิก</Text>
            </TouchableOpacity>
            <Text style={styles.title}>สร้างโพสต์</Text>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={isLoading || content.trim().length === 0}
            >
              <Text style={[
                styles.submitButton,
                (isLoading || content.trim().length === 0) && styles.submitButtonDisabled
              ]}>
                {isLoading ? 'กำลังโพสต์...' : 'โพสต์'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TextInput
              style={styles.textInput}
              placeholder="เขียนอะไรบางอย่าง..."
              value={content}
              onChangeText={setContent}
              maxLength={MAX_POST_CONTENT_LENGTH}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>
              {content.length}/{MAX_POST_CONTENT_LENGTH}
            </Text>

            {image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                <Text style={styles.imageButtonText}>📷 ถ่ายรูป</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                <Text style={styles.imageButtonText}>🖼️ เลือกรูป</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  submitButtonDisabled: {
    color: '#ccc',
  },
  content: {
    padding: 16,
  },
  textInput: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 14,
    color: '#333',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});