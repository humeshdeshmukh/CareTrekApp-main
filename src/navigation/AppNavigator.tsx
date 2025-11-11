// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import SeniorAuthScreen from '../screens/auth/SeniorAuthScreen';
import FamilyAuthScreen from '../screens/auth/FamilyAuthScreen';
import SeniorHomeScreen from '../screens/senior/SeniorHomeScreen';
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import UnauthorizedScreen from '../screens/UnauthorizedScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  SeniorAuth: undefined;
  FamilyAuth: undefined;
  SeniorHome: undefined;
  FamilyHome: undefined;
  Unauthorized: undefined;
  Auth: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          user?.role === 'senior' ? (
            <Stack.Screen name="SeniorHome" component={SeniorHomeScreen} />
          ) : (
            <Stack.Screen name="FamilyHome" component={FamilyHomeScreen} />
          )
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="SeniorAuth" component={SeniorAuthScreen} />
            <Stack.Screen name="FamilyAuth" component={FamilyAuthScreen} />
            <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;