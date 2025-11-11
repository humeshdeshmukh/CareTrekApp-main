import React from 'react';
import { 
  createBottomTabNavigator,
  BottomTabBarButtonProps,
  BottomTabNavigationProp
} from '@react-navigation/bottom-tabs';
import { 
  NavigationContainerRef,
  useNavigationContainerRef
} from '@react-navigation/native';
import { 
  createStackNavigator, 
  StackNavigationProp,
  CardStyleInterpolators
} from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { 
  TouchableOpacity,
  View,
  StyleSheet,
  Platform
} from 'react-native';

import HomeScreenFamily from '../screens/family/HomeScreenFamily';
import SeniorsListScreen from '../screens/family/SeniorsListScreen';
import SeniorDetailScreen from '../screens/family/SeniorDetailScreen';
import AlertsScreen from '../screens/family/AlertsScreen';
import MessagesScreen from '../screens/family/MessagesScreen';
import FamilySettingsScreen from '../screens/family/FamilySettingsScreen';
import NewConnectSeniorScreen from '../screens/family/NewConnectSeniorScreen';
import HealthHistoryScreen from '../screens/family/HealthHistoryScreen';
import ShareIdScreen from '../screens/family/ShareIdScreen';
import AddFamilyKeyScreen from '../screens/family/AddFamilyKeyScreen';

// Type definitions for tab navigation
type FamilyTabParamList = {
  Home: undefined;
  Seniors: { refresh?: boolean };
  Alerts: undefined;
  Messages: undefined;
  Settings: undefined;
};

// Type definitions for stack navigation
type FamilyStackParamList = {
  // Tabs
  MainTabs: undefined;
  
  // Main Screens
  Home: undefined;
  Seniors: { refresh?: boolean };
  SeniorDetail: { 
    seniorId: string; 
    seniorName?: string; 
    seniorAvatar?: string; 
    status?: 'online' | 'offline' | 'alert' 
  };
  ConnectSenior: undefined;
  Alerts: undefined;
  Messages: { 
    seniorId: string; 
    seniorName?: string; 
    seniorAvatar?: string; 
    status?: 'online' | 'offline' | 'alert' 
  };
  Settings: undefined;
  
  // Family Key Management
  ShareId: undefined;
  AddFamilyKey: undefined;
  
  // Other family screens
  SeniorDetailScreen: { seniorId: string };
  NewConnectSenior: undefined;
  FamilySettings: undefined;
  HealthHistory: { seniorId: string };
  
  // Auth
  Logout: undefined;
};

const Tab = createBottomTabNavigator<FamilyTabParamList>();
const Stack = createStackNavigator<FamilyStackParamList>();

// Card style for stack navigation
const cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

// Create a navigation reference that will be used by the app
export let navigationRef: NavigationContainerRef<FamilyStackParamList> | null = null;

// Helper function to navigate to any screen
export function navigate(name: keyof FamilyStackParamList, params?: any) {
  if (navigationRef?.isReady()) {
    navigationRef.navigate(name as any, params);
  }
}

// Custom tab bar button with press handling
const TabBarButton: React.FC<BottomTabBarButtonProps> = ({
  children,
  onPress,
  accessibilityState,
  ...props
}) => {
  const isFocused = accessibilityState?.selected;
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isFocused ? colors.primaryLight : 'transparent',
        margin: 4,
        borderRadius: 8,
      }}
      activeOpacity={0.8}
      // @ts-ignore - Fix for TouchableOpacity type issue
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Tab Navigator for the main family screens
const TabNavigator = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  // Custom tab bar button component
  const TabBarButtonComponent: React.FC<BottomTabBarButtonProps> = (props) => (
    <TabBarButton {...props} />
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
          borderTopColor: isDark ? '#2D3748' : '#E2E8F0',
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: isDark ? '#63B3ED' : '#2B6CB0',
        tabBarInactiveTintColor: isDark ? '#A0AEC0' : '#718096',
        tabBarButton: (props) => <TabBarButtonComponent {...props} />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenFamily}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: t('Home') || 'Home',
        }}
      />
      <Tab.Screen
        name="Seniors"
        component={SeniorsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
          tabBarLabel: t('Seniors') || 'Seniors',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarLabel: t('Alerts') || 'Alerts',
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
          tabBarLabel: t('Messages') || 'Messages',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={FamilySettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarLabel: t('Settings') || 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Main Family Navigator with Stack Navigation
export const FamilyNavigator = () => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  
  // Initialize the navigation ref
  navigationRef = useNavigationContainerRef<FamilyStackParamList>();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: { backgroundColor: colors.background },
        cardStyleInterpolator,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SeniorDetail" 
        component={SeniorDetailScreen} 
        options={{ title: t('Senior Details') || 'Senior Details' }}
      />
      <Stack.Screen 
        name="ConnectSenior" 
        component={NewConnectSeniorScreen} 
        options={{ title: t('Connect Senior') || 'Connect Senior' }}
      />
      <Stack.Screen 
        name="HealthHistory" 
        component={HealthHistoryScreen} 
        options={{ title: t('Health History') || 'Health History' }}
      />
      <Stack.Screen 
        name="ShareId" 
        component={ShareIdScreen} 
        options={{ title: t('Share ID') || 'Share ID' }}
      />
      <Stack.Screen 
        name="AddFamilyKey" 
        component={AddFamilyKeyScreen} 
        options={{ title: t('Add Family Member') || 'Add Family Member' }}
      />
      <Stack.Screen 
        name="FamilySettings" 
        component={FamilySettingsScreen} 
        options={{ 
          title: t('Settings') || 'Settings',
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={({ route }) => ({ 
          title: route.params?.seniorName || t('Messages') || 'Messages',
          headerShown: true,
        })} 
      />
    </Stack.Navigator>
  );
};

export default FamilyNavigator;
