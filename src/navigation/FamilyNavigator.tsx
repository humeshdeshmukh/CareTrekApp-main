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
import FamilySettingsScreen from '../screens/family/FamilySettingsScreen';
import AddSeniorScreen from '../screens/family/AddSeniorScreen';
import EditProfileScreen from '../screens/Senior/EditProfileScreen';

// Senior Management Screens - Removed as per request

// Type definitions for tab navigation
type FamilyTabParamList = {
  HomeTab: undefined;
  Seniors: { refresh?: boolean };
  Medication: { seniorId?: string };
  Reminders: { seniorId?: string };
  Settings: undefined;
};

// Type definitions for stack navigation
type FamilyStackParamList = {
  // Tabs
  MainTabs: undefined;
  
  // Screens
  SeniorDetail: { seniorId: string };
  AddSenior: undefined;
  
  // Settings related
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
};

const Tab = createBottomTabNavigator<FamilyTabParamList>();
const Stack = createStackNavigator<FamilyStackParamList>();

// Card style for stack navigation
const cardStyleInterpolator = CardStyleInterpolators.forHorizontalIOS;

// Create a navigation reference that will be used by the app
export const navigationRef = React.createRef<NavigationContainerRef<FamilyStackParamList>>();

// Helper function to safely navigate to any screen
export function navigate(name: keyof FamilyStackParamList, params?: any) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(name as any, params);
  } else {
    console.warn('Navigation reference is not ready yet');
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
        backgroundColor: isFocused ? `${colors.primary}33` : 'transparent', 
        margin: 4,
        borderRadius: 8,
      }}
      activeOpacity={0.8}
      // Fix for TouchableOpacity type issue
      {...(props as any)}
    >
      {children}
    </TouchableOpacity>
  );
};

// Tab Navigator for the main family screens
const TabNavigator = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Seniors') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Medication') {
            iconName = focused ? 'medkit' : 'medkit-outline';
          } else if (route.name === 'Reminders') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDark ? '#48BB78' : '#2F855A',
        tabBarInactiveTintColor: isDark ? '#A0AEC0' : '#718096',
        tabBarStyle: {
          backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
          borderTopColor: isDark ? '#2D3748' : '#E2E8F0',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreenFamily}
        options={{ title: t('Home') || 'Home' }}
      />
      <Tab.Screen
        name="Seniors"
        component={SeniorsListScreen}
        options={{ title: t('Seniors') || 'Seniors' }}
      />
      <Tab.Screen
        name="Medication"
        component={HomeScreenFamily} // Placeholder - replace with actual Medication screen component
        options={{ title: t('Medication') || 'Medication' }}
      />
      <Tab.Screen
        name="Reminders"
        component={HomeScreenFamily} // Placeholder - replace with actual Reminders screen component
        options={{ title: t('Reminders') || 'Reminders' }}
      />
      <Tab.Screen
        name="Settings"
        component={FamilySettingsScreen}
        options={{ title: t('Settings') || 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// Main Family Navigator with Stack Navigation
export const FamilyNavigator = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1A202C' : '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDark ? '#E2E8F0' : '#1A202C',
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: { backgroundColor: isDark ? '#1A202C' : '#F7FAFC' },
        cardStyleInterpolator,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      
      {/* Senior Management */}
      <Stack.Screen 
        name="SeniorDetail" 
        component={SeniorDetailScreen} 
        options={{ title: t('Senior Details') || 'Senior Details' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={FamilySettingsScreen} 
        options={{ 
          title: t('Settings') || 'Settings',
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: t('Edit Profile') || 'Edit Profile',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default FamilyNavigator;
