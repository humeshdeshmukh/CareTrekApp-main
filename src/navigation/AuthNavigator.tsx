import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/theme/ThemeContext';
import { AuthStackParamList, UserRole } from './types';

// Import screens
import AuthSelectionScreen from '../screens/auth/AuthSelectionScreen';
import FamilyAuthScreen from '../screens/auth/FamilyAuthScreen';
import SeniorAuthScreen from '../screens/auth/SeniorAuthScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
// import EmergencyScreen from '../screens/Senior/EmergencyScreen';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
        cardStyle: { backgroundColor: colors.background },
      }}
      initialRouteName="AuthSelection"
    >
      {/* Auth Selection */}
      <Stack.Screen 
        name="AuthSelection" 
        component={AuthSelectionScreen}
        options={{ headerShown: false }}
      />

      {/* Family Authentication */}
      <Stack.Screen 
        name="FamilyAuth" 
        component={FamilyAuthScreen}
        options={{ 
          title: 'Family Member Sign In',
          headerBackTitle: 'Back',
        }}
      />

      {/* Senior Authentication */}
      <Stack.Screen 
        name="SeniorAuth" 
        component={SeniorAuthScreen}
        options={{ 
          title: 'Senior Sign In',
          headerBackTitle: 'Back',
        }}
      />

      {/* Shared Auth Screens */}
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen}
        options={{ 
          title: 'Sign In',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ 
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ 
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />

      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen}
        options={{ 
          title: 'Verify Phone',
          headerBackTitle: 'Back',
        }}
      />

      {/* Emergency Screen - Accessible from senior auth
      <Stack.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ 
          title: 'Emergency SOS',
          headerShown: false,
          gestureEnabled: false,
        }} */}
      
    </Stack.Navigator>
  );
};
