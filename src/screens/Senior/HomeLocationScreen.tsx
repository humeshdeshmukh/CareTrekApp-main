import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

type RootStackParamList = {
  Map: undefined;
  HomeLocation: undefined;
};

type HomeLocationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeLocation'>;

type HomeLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
} | null;

const HomeLocationScreen = () => {
  const navigation = useNavigation<HomeLocationScreenNavigationProp>();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [homeLocation, setHomeLocation] = useState<HomeLocation>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    getCurrentLocation();
    fetchHomeLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to set your home location');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation(prev => ({
        ...prev,
        latitude,
        longitude,
      }));

      // Get address from coordinates
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const formattedAddress = `${address.name || ''} ${address.street || ''} ${address.city || ''} ${address.region || ''} ${address.postalCode || ''}`.trim();
        setAddress(formattedAddress || 'Address not available');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeLocation = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('home_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned"
        throw error;
      }

      if (data) {
        setHomeLocation(data);
        setAddress(data.address || '');
        setCurrentLocation(prev => ({
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
        }));
      }
    } catch (error) {
      console.error('Error fetching home location:', error);
      Alert.alert('Error', 'Failed to load home location');
    }
  };

  const saveHomeLocation = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to save a home location');
      return;
    }

    setSaving(true);
    try {
      const homeLocationData = {
        user_id: user.id,
        name: 'Home',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: address,
      };

      // Upsert the home location
      const { error } = await supabase
        .from('home_locations')
        .upsert(
          { ...homeLocationData, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setHomeLocation({
        id: homeLocation?.id || '',
        ...homeLocationData,
      });
      
      Alert.alert('Success', 'Home location saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving home location:', error);
      Alert.alert('Error', 'Failed to save home location');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.darkText]}>Set Home Location</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={currentLocation}
          onRegionChangeComplete={region => {
            setCurrentLocation(region);
          }}
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Home"
            description={address}
          >
            <Ionicons name="home" size={32} color={isDark ? '#4dabf7' : '#1e88e5'} />
          </Marker>
        </MapView>
      </View>

      <View style={[styles.addressContainer, isDark && styles.darkAddressContainer]}>
        <Ionicons name="location" size={20} color={isDark ? '#fff' : '#666'} />
        <Text style={[styles.addressText, isDark && styles.darkText]} numberOfLines={2}>
          {address || 'Move the map to set your home location'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, (saving || !address) && styles.disabledButton]}
        onPress={saveHomeLocation}
        disabled={saving || !address}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {homeLocation ? 'Update Home Location' : 'Save Home Location'}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  darkAddressContainer: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1e88e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#90caf9',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeLocationScreen;
