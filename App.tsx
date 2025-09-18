import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { initDatabase } from './database/database';
import { initDatabase as initWebDatabase } from './database/database.web';
import { requestLocationPermission } from './services/locationService';
import { hasUserData, isFirstLaunch } from './services/storageService';
import { getErrorMessage } from './services/errorService';
import { initSentryWeb, initSentryMobile } from './src/services/sentryService';
import { initWebVitals } from './src/services/webVitalsService';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import MainScreen from './screens/MainScreen';
import PostCreationScreen from './screens/PostCreationScreen';
import ChatScreen from './screens/ChatScreen';
import type { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('UsernameSetup');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 0. Initialize monitoring
      if (Platform.OS === 'web') {
        initSentryWeb();
        initWebVitals();
      } else {
        initSentryMobile();
      }

      // 1. เริ่มต้น database
      console.log('Initializing database...');
      if (Platform.OS === 'web') {
        await initWebDatabase();
      } else {
        await initDatabase();
      }

      // 2. ขอ permission location
      console.log('Requesting location permission...');
      const locationPermission = await requestLocationPermission();
      if (!locationPermission) {
        setError('ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตในการตั้งค่า');
        return;
      }

      // 3. ตรวจสอบ user status
      const firstLaunch = await isFirstLaunch();
      if (firstLaunch) {
        setInitialRoute('UsernameSetup');
      } else {
        const userExists = await hasUserData();
        setInitialRoute(userExists ? 'Main' : 'UsernameSetup');
      }

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>กำลังเริ่มต้นแอพ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>เกิดข้อผิดพลาด</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeApp}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen 
          name="UsernameSetup" 
          component={UsernameSetupScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PostCreation" 
          component={PostCreationScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});