import React from 'react';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/store';
import { ThemeProvider } from './src/contexts/theme/ThemeContext';
import { TranslationProvider } from './src/contexts/translation/TranslationContext';
import { AuthProvider } from './src/contexts/auth/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Main App component
export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
        </View>
      } persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <TranslationProvider>
              <ThemeProvider>
                <PaperProvider>
                  <AuthProvider>
                    <NavigationContainer>
                      <RootNavigator />
                      <StatusBar style="auto" />
                    </NavigationContainer>
                  </AuthProvider>
                </PaperProvider>
              </ThemeProvider>
            </TranslationProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
