import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  AddSenior: undefined;
  HealthHistory: { seniorId: string };
  Alerts: undefined;
  Messages: undefined;
  // Add other screens as needed
};

const HomeScreenFamily = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const handleAddSenior = () => {
    navigation.navigate('AddSenior');
  };

  const navigateToHealthHistory = () => {
    // For now, we'll pass a default seniorId. In a real app, you'd get this from your state or props
    // For example, if you have a selected senior in your state:
    // navigation.navigate('HealthHistory', { seniorId: selectedSeniorId });
    
    // For now, we'll use a placeholder ID. Replace this with actual logic to get the seniorId
    navigation.navigate('HealthHistory', { seniorId: 'default-senior-id' });
  };
  
  const navigateToScreen = (screenName: keyof Omit<RootStackParamList, 'HealthHistory'>) => {
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
            <Text style={[styles.cardSubtitle, { color: isDark ? '#A0AEC0' : '#4A5568' }]}>
              {t('Connect to your loved ones')}
            </Text>
            
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
