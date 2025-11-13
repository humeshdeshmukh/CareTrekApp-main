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
import FamilySettingsScreen from '../screens/family/FamilySettingsScreen';
import HealthHistoryScreen from '../screens/family/HealthHistoryScreen';
import AddSeniorScreen from '../screens/family/AddSeniorScreen';
import EditProfileScreen from '../screens/Senior/EditProfileScreen';

// Type definitions for tab navigation
type FamilyTabParamList = {
  HomeTab: undefined;
  Seniors: { refresh?: boolean };
  Alerts: undefined;
  Settings: undefined;
};

// Type definitions for stack navigation
type FamilyStackParamList = {
  // Tabs
  MainTabs: undefined;
  
  // Screens
  SeniorDetail: { seniorId: string };
  NewConnectSenior: undefined;
  HealthHistory: { seniorId: string };
  HomeNew: undefined;
  AddSenior: undefined;
  
  // Modals
  FilterAlerts: undefined;
  FilterMessages: undefined;
  SortSeniors: undefined;
  SortAlerts: undefined;
  SortMessages: undefined;
  
  // Other
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  About: undefined;
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
        name="HomeTab"
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
  
  // No need to reinitialize the ref, using the one created above

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
      // @ts-ignore - navigationRef is a valid prop for Stack.Navigator
      ref={navigationRef}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HomeNew" 
        component={HomeScreenFamily} 
        options={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
      <Stack.Screen 
        name="AddSenior" 
        component={AddSeniorScreen} 
        options={{
          title: t('Add Senior'),
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen 
        name="SeniorDetail" 
        component={SeniorDetailScreen} 
        options={{ title: t('Senior Details') || 'Senior Details' }}
      />
      <Stack.Screen 
        name="HealthHistory" 
        component={HealthHistoryScreen} 
        options={{ title: t('Health History') || 'Health History' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={FamilySettingsScreen} 
        options={{ 
          title: t('Settings') || 'Settings',
          headerShown: true,
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
