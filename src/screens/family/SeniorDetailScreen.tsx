import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  ImageSourcePropType
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';
import { supabase } from '../../lib/supabase';

// Default image
const defaultAvatar: ImageSourcePropType = require('../../../assets/icon.png');

// Theme colors
const colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#4F46E5',
  notification: '#DC2626',
  border: '#E5E7EB',
  text: '#111827',
  muted: '#6B7280',
};

// Define the navigation parameters for the screens we'll be navigating to
type RootStackParamList = {
  SeniorDetail: { seniorId: string };
  TrackSenior: { seniorId: string };
  Messages: { seniorId: string; seniorName?: string; seniorAvatar?: string; status?: string };
  Health: undefined;
  Medication: { seniorId: string };
  Reminders: { seniorId: string };
  SeniorAppointments: { seniorId: string };
  Settings: undefined;
  // Add other screens as needed
  [key: string]: any;
};

type NavigationProp = StackNavigationProp<RootStackParamList> & {
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params: RootStackParamList[T]
  ) => void;
};

type SeniorLocal = {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'alert';
  lastActive: string;
  avatar?: string;
  heartRate?: number;
  oxygen?: number;
  steps?: number;
  battery?: number;
  location: string;
  relationship?: string;
  email?: string;
  phone?: string;
};

type SeniorDetailRouteProp = RouteProp<RootStackParamList, 'SeniorDetail'>;

// Navigation options configuration
const NAVIGATION_OPTIONS = [
  {
    id: 'health',
    title: 'Health',
    icon: 'heart-outline' as const,
    screen: 'Health' as const,
    params: (seniorId: string) => ({ seniorId })
  },
  {
    id: 'medication',
    title: 'Medication',
    icon: 'medical-outline' as const,
    screen: 'Medication' as const,
    params: (seniorId: string) => ({ seniorId })
  },
  {
    id: 'reminders',
    title: 'Reminders',
    icon: 'notifications-outline' as const,
    screen: 'Reminders' as const,
    params: (seniorId: string) => ({ seniorId })
  },
  {
    id: 'appointments',
    title: 'Appointments',
    icon: 'calendar-outline' as const,
    screen: 'SeniorAppointments' as const,
    params: (seniorId: string) => ({ seniorId })
  }
];

const SeniorDetailScreen: React.FC = () => {
  // Navigation and theme hooks
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<{ params: { seniorId: string } }>>();
  const { isDark } = useTheme();
  const { currentLanguage } = useTranslation();
  
  // Translations
  const { translatedText: loadingText } = useCachedTranslation('Loading senior...', currentLanguage);
  const { translatedText: retryText } = useCachedTranslation('Retry', currentLanguage);
  const { translatedText: errorText } = useCachedTranslation('Unable to load senior', currentLanguage);
  
  // Get seniorId from route params with a default value
  const seniorId = route.params?.seniorId || 'default-senior-id';
  
  // State hooks in a consistent order
  const [senior, setSenior] = useState<SeniorLocal | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status color function with theme support
  const getStatusColor = (status: SeniorLocal['status']) => {
    if (status === 'online') return '#48BB78'; // Green for online
    if (status === 'alert') return '#F56565'; // Red for alert
    return '#A0AEC0'; // Gray for offline
  };

  // fetch senior details from Supabase
  const fetchSeniorDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch senior profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', seniorId)
        .single();

      if (profileError) throw profileError;
      
      // Fetch senior details from seniors table if available
      const { data: seniorData, error: seniorError } = await supabase
        .from('seniors')
        .select('*')
        .eq('user_id', seniorId)
        .single();
      
      // If there's an error fetching senior data, just log it and continue with profile data
      if (seniorError) {
        console.warn('Error fetching senior details:', seniorError);
      }

      // Combine profile and senior data
      const seniorProfile: SeniorLocal = {
        id: seniorId,
        name: profileData.display_name || 'Senior',
        status: 'online', // You might want to implement actual status checking
        lastActive: new Date().toISOString(),
        location: seniorData?.address || 'Location not set',
        avatar: profileData.avatar_url || '',
        relationship: seniorData?.relationship || 'Senior',
        email: profileData.email || '',
        phone: profileData.phone_number || 'Phone not set'
      };
      
      setSenior(seniorProfile);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching senior details:', err);
      setError('Failed to load senior details');
      setLoading(false);
      
      // Set a default senior if there's an error
      setSenior({
        id: seniorId,
        name: 'Senior',
        status: 'offline',
        lastActive: new Date().toISOString(),
        location: 'Location not available',
        avatar: '',
        relationship: 'Senior',
        email: '',
        phone: 'Phone not available'
      });
    }
  }, [seniorId]);
  
  // Load senior data on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchSeniorDetails();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchSeniorDetails]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchSeniorDetails();
      }
    };
    
    loadData();
    
    // Set up a simple interval to simulate real-time updates
    const intervalId = setInterval(() => {
      if (isMounted) {
        setSenior(prev => ({
          ...prev!,
          lastActive: new Date().toISOString(),
        }));
      }
    }, 60000); // Update every minute
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchSeniorDetails, isConnected]);

  const toggleConnection = useCallback(async () => {
    if (!senior) return;
    
    const newStatus = !isConnected;
    
    try {
      // Update connection status in the database
      const { error } = await supabase
        .from('family_connections')
        .update({ status: newStatus ? 'active' : 'inactive' })
        .eq('senior_user_id', seniorId);
      
      if (error) throw error;
      
      // Update local state
      setIsConnected(newStatus);
      
      setSenior(prev => prev ? {
        ...prev,
        status: newStatus ? 'online' : 'offline',
        lastActive: new Date().toISOString()
      } : null);
      
      console.log(`Successfully ${newStatus ? 'connected to' : 'disconnected from'} senior:`, senior.name);
      
    } catch (err) {
      console.error('Error updating connection status:', err);
      // Revert the toggle if there's an error
      setIsConnected(!newStatus);
    }
  }, [senior, isConnected, seniorId]);

  // Render loading state if data is being fetched
  const renderLoading = () => (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={isDark ? '#48BB78' : '#2F8550'} />
      <Text style={[styles.muted, { marginTop: 12, color: isDark ? '#94A3B8' : '#64748B' }]}>
        {loadingText}
      </Text>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={isDark ? '#48BB78' : '#2F855A'} />
          <Text style={[styles.muted, { marginTop: 12, color: isDark ? '#94A3B8' : '#64748B' }]}>
            {loadingText}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!senior) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
        <View style={styles.centered}>
          <Ionicons 
            name="warning" 
            size={48} 
            color={isDark ? '#F56565' : '#DC2626'} 
          />
          <Text style={[styles.muted, { marginTop: 16, color: isDark ? '#E2E8F0' : '#4A5568' }]}>
            No senior data available
          </Text>
          <TouchableOpacity 
            style={[styles.button, { 
              backgroundColor: isDark ? '#48BB78' : '#2F855A',
              marginTop: 16,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8
            }]} 
            onPress={fetchSeniorDetails}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
        <View style={styles.centered}>
          <Ionicons 
            name="warning" 
            size={56} 
            color={isDark ? '#F56565' : '#DC2626'} 
          />
          <Text style={[styles.errorText, { color: isDark ? '#F56565' : '#DC2626', marginTop: 12 }]}>
            {errorText}
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, { 
              backgroundColor: isDark ? '#48BB78' : '#2F855A',
              marginTop: 24
            }]} 
            onPress={fetchSeniorDetails}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              {retryText}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Navigation options with proper typing
  const navigationOptions = NAVIGATION_OPTIONS.map(option => {
    const params = option.params(senior.id);
    return {
      ...option,
      onPress: () => {
        // Type assertion to handle the navigation params
        (navigation as any).navigate(option.screen, params);
      }
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
            {senior.name}'s Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarWrapper, { borderColor: isDark ? '#4A5568' : '#E2E8F0' }]}>
              <Image 
                source={senior.avatar ? { uri: senior.avatar } : defaultAvatar} 
                style={styles.avatar} 
              />
              <View 
                style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(senior.status) 
                }]} 
              />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.seniorName, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
                {senior.name}
              </Text>
              <Text style={[styles.relationship, { color: isDark ? '#A0AEC0' : '#64748B' }]}>
                {senior.relationship}
              </Text>
              
              <View style={styles.connectionSwitch}>
                <Text style={[styles.connectionText, { color: isDark ? '#E2E8F0' : '#4A5568' }]}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
                <Switch
                  value={isConnected}
                  onValueChange={toggleConnection}
                  trackColor={{ false: '#E2E8F0', true: isDark ? '#48BB78' : '#2F855A' }}
                  thumbColor="#FFFFFF"
                />
              </View>
              
              {/* Contact Information */}
              <View style={styles.contactInfo}>
                <Text style={[styles.contactSectionTitle, { color: isDark ? '#E2E8F0' : '#4B5563' }]}>
                  Contact Information
                </Text>
                
                <View style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', padding: 10, borderRadius: 8 }]}>
                  <View style={[styles.contactIconContainer, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={18} 
                      color={isDark ? '#A0AEC0' : '#4A5568'} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>Email</Text>
                    <Text style={[styles.contactText, { color: isDark ? '#F8FAFC' : '#1A202C' }]} numberOfLines={1}>
                      {senior.email || 'Not provided'}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', padding: 10, borderRadius: 8 }]}>
                  <View style={[styles.contactIconContainer, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}>
                    <Ionicons 
                      name="call-outline" 
                      size={18} 
                      color={isDark ? '#A0AEC0' : '#4A5568'} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>Phone</Text>
                    <Text style={[styles.contactText, { color: isDark ? '#F8FAFC' : '#1A202C' }]}>
                      {senior.phone || 'Not provided'}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.contactItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', padding: 10, borderRadius: 8 }]}>
                  <View style={[styles.contactIconContainer, { backgroundColor: isDark ? '#2D3748' : '#EDF2F7' }]}>
                    <Ionicons 
                      name="location-outline" 
                      size={18} 
                      color={isDark ? '#A0AEC0' : '#4A5568'} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.contactLabel, { color: isDark ? '#A0AEC0' : '#718096' }]}>Address</Text>
                    <Text style={[styles.contactText, { color: isDark ? '#F8FAFC' : '#1A202C' }]}>
                      {senior.location || 'Not provided'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Options */}
        <View style={styles.optionsContainer}>
          {navigationOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: isDark ? '#2D3748' : '#F8FAFC' }]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={22} 
                  color={isDark ? '#48BB78' : '#2F855A'} 
                />
              </View>
              <Text style={[styles.optionText, { color: isDark ? '#F8FAFC' : '#1E293B' }]}>
                {option.title}
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDark ? '#718096' : '#A0AEC0'} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Last Seen */}
        <View style={[styles.lastSeenContainer, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
          <Ionicons name="time" size={16} color={isDark ? '#A0AEC0' : '#718096'} />
          <Text style={[styles.lastSeenText, { color: isDark ? '#A0AEC0' : '#718096' }]}>
            Last active: {formatLastSeen(senior.lastActive)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper function to format last seen time
const formatLastSeen = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  muted: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButton: {
    shadowColor: '#2F855A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  profileCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  seniorName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Inter_700Bold',
  },
  relationship: {
    fontSize: 15,
    marginBottom: 16,
    fontFamily: 'Inter_500Medium',
  },
  connectionSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  connectionText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  contactInfo: {
    marginTop: 16,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  contactSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4B5563',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
    fontFamily: 'Inter_700Bold',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Inter_500Medium',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignSelf: 'center',
  },
  // Navigation Options
  optionsContainer: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  // Last Seen
  lastSeenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 24,
    marginTop: 8,
  },
  lastSeenText: {
    fontSize: 13,
    marginLeft: 8,
    fontFamily: 'Inter_500Medium',
  }
});

export default SeniorDetailScreen;
