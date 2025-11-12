import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { ThemeProvider, useTheme } from './src/contexts/theme/ThemeContext';
import { TranslationProvider } from './src/contexts/translation/TranslationContext';
import { AuthProvider, useAuth } from './src/contexts/auth/AuthContext';
import { View, StyleSheet } from 'react-native';
import { navigationRef } from './src/navigation/NavigationService';
import linking from './src/navigation/linking';
import ErrorBoundary, { DefaultFallback } from './src/components/ErrorBoundary';
import { RootStackParamList } from './src/navigation/types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import FamilySignInScreen from './src/screens/auth/FamilySignInScreen';
import SeniorAuthScreen from './src/screens/auth/SeniorAuthScreen';
import OTPVerificationScreen from './src/screens/auth/OTPVerificationScreen';
import FamilyNavigator from './src/navigation/FamilyNavigator';
import { SeniorTabs } from './src/navigation/SeniorTabs';
import SOSContactsScreen from './src/screens/Senior/SOSContactsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator - Handles all authentication-related screens
function AuthNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="FamilySignIn" component={FamilySignInScreen} />
      <Stack.Screen name="SeniorAuth" component={SeniorAuthScreen} />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen} 
        options={{
          headerShown: true,
          title: 'Verify OTP',
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}

// App Navigator - Handles main app navigation after authentication
function AppNavigator() {
  const { colors } = useTheme();
  const { userRole } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {userRole === 'family' ? (
        <>
          <Stack.Screen name="MainTabs" component={FamilyNavigator} />
        </>
      ) : (
        <>
          <Stack.Screen name="SeniorHome" component={SeniorTabs} />
          <Stack.Screen 
            name="SOSContacts" 
            component={SOSContactsScreen} 
            options={{
              headerShown: true,
              title: 'SOS Contacts',
              headerBackTitle: 'Back',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Root Navigator - Switches between Auth and App navigators
function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading, checkAuthState } = useAuth();

  // Check authentication state on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.notification,
    },
  };

  // Show loading indicator while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer 
      ref={navigationRef} 
      linking={linking}
      theme={navTheme}
      fallback={
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      }
    >
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

// Main App component
export default function App() {
  return (
    <ErrorBoundary FallbackComponent={DefaultFallback}>
      <ReduxProvider store={store}>
        <PersistGate 
          loading={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
            </View>
          } 
          persistor={persistor}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <TranslationProvider>
                <ThemeProvider>
                  <PaperProvider>
                    <AuthProvider>
                      <RootNavigator />
                    </AuthProvider>
                  </PaperProvider>
                </ThemeProvider>
              </TranslationProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </PersistGate>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
