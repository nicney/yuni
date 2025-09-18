import React, { useState } from 'react';
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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { saveUser, generateDeviceId, setFirstLaunch } from '../services/storageService';
import { validateUsername } from '../services/validationService';
import { getErrorMessage } from '../services/errorService';
import type { RootStackParamList } from '../types';

type UsernameSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UsernameSetup'>;
type UsernameSetupScreenRouteProp = RouteProp<RootStackParamList, 'UsernameSetup'>;

interface Props {
  navigation: UsernameSetupScreenNavigationProp;
  route: UsernameSetupScreenRouteProp;
}

export default function UsernameSetupScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate username
      const validation = validateUsername(username);
      if (!validation.isValid) {
        Alert.alert('ข้อผิดพลาด', validation.errors[0]?.message || 'ชื่อผู้ใช้ไม่ถูกต้อง');
        return;
      }

      // Generate device ID
      const deviceId = generateDeviceId();

      // Save user data
      await saveUser({
        username: username.trim(),
        device_id: deviceId,
      });

      // Mark as not first launch
      await setFirstLaunch();

      // Navigate to main screen
      navigation.replace('Main');
    } catch (error) {
      console.error('Error setting up username:', error);
      Alert.alert('ข้อผิดพลาด', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>ยินดีต้อนรับสู่ Yuni</Text>
          <Text style={styles.subtitle}>
            ตั้งชื่อเล่นของคุณเพื่อเริ่มต้นใช้งาน
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="ชื่อเล่นของคุณ"
              value={username}
              onChangeText={setUsername}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading || username.trim().length === 0}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>เริ่มต้นใช้งาน</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            ชื่อเล่นนี้จะแสดงในโพสต์ของคุณ
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});