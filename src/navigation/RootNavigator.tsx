import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/theme/ThemeContext';
import AuthCheck from './AuthCheck';

// Import auth screens and navigator
import { AuthNavigator } from './AuthNavigator';
import FamilyAuthScreen from '../screens/auth/FamilyAuthScreen';
import SeniorAuthScreen from '../screens/auth/SeniorAuthScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';

// Import initial flow screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LanguageScreen from '../screens/LanguageScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';

// Import main app screens
import SeniorDashboard from '../screens/Senior/HomeScreen';
import HealthScreen from '../screens/Senior/HealthScreen';
import MapScreen from '../screens/Senior/MapScreen';
import RemindersScreen from '../screens/Senior/RemindersScreen';
import IdShareScreen from '../screens/Senior/IdShareScreen';
import SOSContactsScreen from '../screens/Senior/SOSContactsScreen';

// Import family screens
import HomeScreenFamily from '../screens/family/HomeScreenFamily';
import NewConnectSeniorScreen from '../screens/family/NewConnectSeniorScreen';
import SeniorDetailScreen from '../screens/family/SeniorDetailScreen';
import AlertsScreen from '../screens/family/AlertsScreen';
import MessagesScreen from '../screens/family/MessagesScreen';
import FamilySettingsScreen from '../screens/family/FamilySettingsScreen';
import SeniorsListScreen from '../screens/family/SeniorsListScreen';

// Import navigators
import FamilyNavigator from './FamilyNavigator';
import { SeniorTabs } from './SeniorTabs';

export type RootStackParamList = {
  // Auth Stack
  Auth: {
    screen: keyof AuthStackParamList;
    params?: any;
  };
  // Role selection screen
  RoleSelection: undefined;
  FamilyAuth: { role?: UserRole };
  SeniorAuth: { role?: UserRole };
  SignIn: { role?: UserRole };
  SignUp: { role?: UserRole };
  ForgotPassword: undefined;
  OTPVerification: { 
    phoneNumber: string;
    verificationId: string;
    role: UserRole;
    isSignUp?: boolean;
  };
  Emergency: { role: UserRole };
  
  // Initial flow
  Welcome: undefined;
  Language: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  
  // Main App
  Main: undefined;
  
  // Senior Stack
  SeniorTabs: undefined;
  
  // Family Stack
  FamilyNavigator: undefined;
  HomeScreenFamily: undefined;
  
  // Shared Screens
  HealthHistory: { seniorId?: string };
  MedicationReminder: undefined;
  ActivityTracker: undefined;
  Settings: undefined;
  Messages: { recipientId: string };
  TrackSenior: { seniorId: string };
  AddSenior: undefined;
  ScanQRCode: undefined;
  AddFamilyMember: undefined;
  ConnectSenior: undefined;
  
  // Family Screens
  SeniorDetail: { seniorId: string };
  SeniorsList: undefined;
  Alerts: undefined;
  FamilySettings: undefined;
  
  // Id Share Screen
  IdShare: undefined;
  Map: undefined;
  Reminders: undefined;
  SOSContacts: undefined;
};

// Import AuthStackParamList from types
import { AuthStackParamList, UserRole } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <AuthCheck>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' },
        }}
      >
        {/* Initial screens */}
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Language" 
          component={LanguageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        
        {/* Role Selection Screen */}
        <Stack.Screen 
          name="RoleSelection" 
          component={RoleSelectionScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        
        {/* Auth Stack */}
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        
        {/* Individual auth screens (kept for direct navigation if needed) */}
        <Stack.Screen 
          name="FamilyAuth" 
          component={FamilyAuthScreen}
          options={{
            title: 'Family Member',
            headerShown: true,
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          }}
        />
        
        <Stack.Screen 
          name="SeniorAuth" 
          component={SeniorAuthScreen}
          options={{
            title: 'Senior',
            headerShown: true,
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          }}
        />
        
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
          options={{
            title: 'Verify Phone',
            headerShown: true,
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          }}
        />
        
        {/* Emergency Screen
        <Stack.Screen 
          name="Emergency" 
          component={EmergencyScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        
        <Stack.Screen name="SOSContacts" component={SOSContactsScreen} /> */}
      
      {/* Main App Tabs */}
      <Stack.Screen 
        name="SeniorTabs" 
        component={SeniorTabs}
        options={{ gestureEnabled: false }}
      />
      
      {/* Family Navigator */}
      <Stack.Screen 
        name="FamilyNavigator" 
        component={FamilyNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Health History Screen */}
      <Stack.Screen 
        name="HealthHistory" 
        component={require('../screens/family/HealthHistoryScreen').default}
        options={{ 
          title: 'Health History',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      {/* Settings Screen */}
      <Stack.Screen 
        name="Settings" 
        component={require('../screens/family/FamilySettingsScreen').default}
        options={{ 
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      {/* Individual Family Screens - These can be navigated to directly */}
      <Stack.Screen 
        name="HomeScreenFamily" 
        component={HomeScreenFamily} 
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="IdShare" 
        component={IdShareScreen}
        options={{ 
          title: 'Share ID',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      <Stack.Screen 
        name="ConnectSenior" 
        component={NewConnectSeniorScreen}
        options={{
          headerShown: true,
          title: 'Connect Senior'
        }}
      />
      
      <Stack.Screen 
        name="SeniorDetail" 
        component={SeniorDetailScreen}
        options={{
          headerShown: true,
          title: 'Senior Details'
        }}
      />
      
      <Stack.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{
          headerShown: true,
          title: 'Alerts'
        }}
      />
      
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          headerShown: true,
          title: 'Messages'
        }}
      />
      
      <Stack.Screen 
        name="FamilySettings" 
        component={FamilySettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings'
        }}
      />
      
      <Stack.Screen 
        name="TrackSenior" 
        component={MapScreen} // Using MapScreen for tracking
        options={{
          headerShown: true,
          title: 'Track Senior',
          headerBackTitle: 'Back',
          headerTintColor: isDark ? '#FFFFFF' : '#2D3748',
          headerStyle: {
            backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  </AuthCheck>
  );
};

export default RootNavigator;
