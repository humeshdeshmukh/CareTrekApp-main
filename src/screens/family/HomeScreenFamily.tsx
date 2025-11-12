import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

interface Senior {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'alert';
  lastActive: string;
  avatar_url?: string;
  email?: string;
}

type RootStackParamList = {
  AddSenior: undefined;
  HealthHistory: { seniorId: string };
  Alerts: undefined;
  Messages: undefined;
  SeniorDetail: { seniorId: string };
};

const HomeScreenFamily = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const { t } = useTranslation();
  const [connectedSeniors, setConnectedSeniors] = useState<Senior[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  
  // Get text color based on theme
  const textColor = isDark ? colors.text : colors.textDark;

  // Define the type for the relationship with profile
  interface UserProfile {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  }

  interface RelationshipWithProfile {
    senior_user_id: string;
    user_profiles: UserProfile[];
  }

  // Fetch connected seniors
  const fetchConnectedSeniors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get relationships with user profiles using explicit join
      const { data: relationships, error: relError } = await supabase
        .from('family_relationships')
        .select(`
          senior_user_id,
          user_profiles!inner(
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('family_member_id', user.id);

      if (relError) throw relError;

      if (relationships && relationships.length > 0) {
        // Map the data to the Senior type
        const seniors: Senior[] = relationships.map(rel => {
          const profile = rel.user_profiles?.[0] || {};
          return {
            id: rel.senior_user_id,
            name: profile.full_name || `Senior ${rel.senior_user_id.substring(0, 6)}`,
            status: 'offline', // Default status, you can implement actual status checking
            lastActive: new Date().toISOString(),
            avatar_url: profile.avatar_url,
            email: profile.email
          };
        });

        setConnectedSeniors(seniors);
      } else {
        // If no relationships found, clear the list
        setConnectedSeniors([]);
      }
    } catch (error) {
      console.error('Error fetching connected seniors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchConnectedSeniors();
    }
  }, [isFocused]);

  const navigateToHealthHistory = (seniorId: string) => (event: any) => {
    event.stopPropagation();
    navigation.navigate('HealthHistory', { seniorId });
  };

  const navigateToSeniorDetail = (seniorId: string) => {
    navigation.navigate('SeniorDetail', { seniorId });
  };

  const handleAddSenior = () => {
    navigation.navigate('AddSenior');
  };
  
  const navigateToScreen = (screenName: keyof Omit<RootStackParamList, 'HealthHistory' | 'SeniorDetail'>) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#171923' : '#FFFBEF' }]}>
      <View style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
              {t('CareTrek')}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
            <Text style={[styles.cardTitle, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
              {t('Welcome')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#4A5568', marginBottom: 16 }]}>
              {t('Connect to your loved ones')}
            </Text>

            {/* Connected Seniors List */}
            {connectedSeniors.length > 0 && (
              <View style={styles.seniorsContainer}>
                <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 8 }]}>
                  {t('Connected Seniors')}
                </Text>
                <FlatList
                  data={connectedSeniors}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.seniorCard, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}
                      onPress={() => navigateToSeniorDetail(item.id)}
                    >
                      <View style={styles.seniorAvatar}>
                        {item.avatar_url ? (
                          <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
                        ) : (
                          <Ionicons name="person" size={32} color={isDark ? '#E2E8F0' : '#4A5568'} />
                        )}
                        <View style={[styles.statusDot, { 
                          backgroundColor: item.status === 'online' ? '#48BB78' : 
                                         item.status === 'alert' ? '#F56565' : '#A0AEC0' 
                        }]} />
                      </View>
                      <Text style={[styles.seniorName, { color: textColor }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <TouchableOpacity 
                        style={[styles.healthButton, { backgroundColor: isDark ? '#4299E1' : '#2B6CB0' }]}
                        onPress={() => navigateToHealthHistory(item.id)}
                      >
                        <Ionicons name="fitness" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#48BB78' : '#2F855A' }]}
                onPress={handleAddSenior}
              >
                <Ionicons name="person-add" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {t('Connect to Senior')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#4299E1' : '#2B6CB0' }]}
                onPress={navigateToHealthHistory}
              >
                <Ionicons name="medical" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {t('Health History')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#F6AD55' : '#DD6B20' }]}
                onPress={() => navigateToScreen('Alerts')}
              >
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {t('Alerts')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDark ? '#9F7AEA' : '#6B46C1' }]}
                onPress={() => navigateToScreen('Messages')}
              >
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>
                  {t('Messages')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  seniorsContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  seniorCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  seniorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  seniorName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: '100%',
  },
  healthButton: {
    padding: 6,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreenFamily;
