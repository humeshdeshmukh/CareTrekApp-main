import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useTranslation } from '../../contexts/translation/TranslationContext';
import { useCachedTranslation } from '../../hooks/useCachedTranslation';
import { useAuth } from '../../contexts/auth/AuthContext';

type SettingsStackParamList = {
  EditProfile: undefined;
  NotificationSettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpCenter: undefined;
  ContactSupport: undefined;
  // Add Auth stack for logout
  Auth: undefined;
};

const FamilySettingsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<SettingsStackParamList>>();
  const { isDark, toggleTheme, colors } = useTheme();
  const { currentLanguage } = useTranslation();
  const { user: authUser, signOut } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = useState(true);
  const [emergencyAlertsEnabled, setEmergencyAlertsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  
  // Get user data from auth context with fallbacks
  const user = {
    name: authUser?.displayName || authUser?.email?.split('@')[0] || 'User',
    email: authUser?.email || 'No email available',
    avatar: authUser?.photoURL || undefined,
  };

  // Translations
  const { translatedText: settingsText } = useCachedTranslation('Settings', currentLanguage);
  const { translatedText: accountText } = useCachedTranslation('Account', currentLanguage);
  const { translatedText: editProfileText } = useCachedTranslation('Edit Profile', currentLanguage);
  const { translatedText: notificationSettingsText } = useCachedTranslation('Notification Settings', currentLanguage);
  const { translatedText: preferencesText } = useCachedTranslation('Preferences', currentLanguage);
  const { translatedText: darkModeText } = useCachedTranslation('Dark Mode', currentLanguage);
  const { translatedText: notificationsText } = useCachedTranslation('Notifications', currentLanguage);
  const { translatedText: locationSharingText } = useCachedTranslation('Location Sharing', currentLanguage);
  const { translatedText: emergencyAlertsText } = useCachedTranslation('Emergency Alerts', currentLanguage);
  const { translatedText: supportText } = useCachedTranslation('Support', currentLanguage);
  const { translatedText: helpCenterText } = useCachedTranslation('Help Center', currentLanguage);
  const { translatedText: contactSupportText } = useCachedTranslation('Contact Support', currentLanguage);
  const { translatedText: aboutText } = useCachedTranslation('About', currentLanguage);
  const { translatedText: privacyPolicyText } = useCachedTranslation('Privacy Policy', currentLanguage);
  const { translatedText: termsOfServiceText } = useCachedTranslation('Terms of Service', currentLanguage);
  const { translatedText: versionText } = useCachedTranslation('Version', currentLanguage);
  const { translatedText: signOutText } = useCachedTranslation('Sign Out', currentLanguage);
  const { translatedText: signOutConfirmationText } = useCachedTranslation('Are you sure you want to sign out?', currentLanguage);
  const { translatedText: cancelText } = useCachedTranslation('Cancel', currentLanguage);
  const { translatedText: confirmText } = useCachedTranslation('Confirm', currentLanguage);

  const handleSignOut = async () => {
    Alert.alert(
      signOutText,
      signOutConfirmationText,
      [
        {
          text: cancelText,
          style: 'cancel',
        },
        {
          text: confirmText,
          onPress: async () => {
            try {
              await signOut();
              // Navigate to auth stack after successful sign out
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const openLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}?subject=CareTrek Support`);
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    toggleTheme();
  };

  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, { color: isDark ? '#A0AEC0' : '#718096' }]}>
      {title}
    </Text>
  );

  const renderSettingItem = ({
    icon,
    label,
    onPress,
    isSwitch = false,
    switchValue,
    onSwitchValueChange,
    showChevron = true,
    isLast = false,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    isSwitch?: boolean;
    switchValue?: boolean;
    onSwitchValueChange?: (value: boolean) => void;
    showChevron?: boolean;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: isDark ? '#2D3748' : '#E2E8F0' },
      ]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.settingLeft}>
        <MaterialIcons 
          name={icon as any} 
          size={24} 
          color={isDark ? '#E2E8F0' : '#4A5568'} 
          style={styles.settingIcon}
        />
        <Text style={[styles.settingLabel, { color: isDark ? '#E2E8F0' : '#1A202C' }]}>
          {label}
        </Text>
      </View>
      
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchValueChange}
          trackColor={{ false: isDark ? '#4A5568' : '#E2E8F0', true: isDark ? '#48BB78' : '#38A169' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={isDark ? '#4A5568' : '#E2E8F0'}
        />
      ) : showChevron ? (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDark ? '#A0AEC0' : '#718096'} 
        />
      ) : null}
    </TouchableOpacity>
  );

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1A202C' : '#F7FAFC' }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: isDark ? '#2D3748' : '#FFFFFF' }]}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{getUserInitials(user.name)}</Text>
              </View>
            )}
          </View>
          <Text 
            style={[styles.userName, { 
              color: isDark ? '#FFFFFF' : '#1A202C',
              maxWidth: '100%',
              paddingHorizontal: 20,
              textAlign: 'center'
            }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user.name}
          </Text>
          <Text 
            style={[styles.userEmail, { 
              color: isDark ? '#A0AEC0' : '#718096',
              maxWidth: '100%',
              paddingHorizontal: 20,
              textAlign: 'center'
            }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {user.email}
          </Text>
          <TouchableOpacity 
            style={[styles.editButton, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.editButtonText, { color: colors.primary }]}>
              {editProfileText || 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.header, { backgroundColor: isDark ? '#1A202C' : '#F7FAFC' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A202C' }]}>
            {settingsText || 'Settings'}
          </Text>
        </View>
        {/* Account Section */}
        {renderSectionHeader(accountText)}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' }]}>
          {renderSettingItem({
            icon: 'person-outline',
            label: editProfileText,
            onPress: () => navigation.navigate('EditProfile'),
          })}
          {renderSettingItem({
            icon: 'notifications-none',
            label: notificationSettingsText,
            onPress: () => navigation.navigate('NotificationSettings'),
          })}
        </View>

        {/* Preferences Section */}
        {renderSectionHeader(preferencesText)}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' }]}>
          {renderSettingItem({
            icon: 'dark-mode',
            label: darkModeText,
            isSwitch: true,
            switchValue: darkMode,
            onSwitchValueChange: toggleDarkMode,
            showChevron: false,
          })}
          {renderSettingItem({
            icon: 'notifications-none',
            label: notificationsText,
            isSwitch: true,
            switchValue: notificationsEnabled,
            onSwitchValueChange: setNotificationsEnabled,
            showChevron: false,
          })}
          {renderSettingItem({
            icon: 'location-on',
            label: locationSharingText,
            isSwitch: true,
            switchValue: locationSharingEnabled,
            onSwitchValueChange: setLocationSharingEnabled,
            showChevron: false,
          })}
          {renderSettingItem({
            icon: 'warning',
            label: emergencyAlertsText,
            isSwitch: true,
            switchValue: emergencyAlertsEnabled,
            onSwitchValueChange: setEmergencyAlertsEnabled,
            showChevron: false,
            isLast: true,
          })}
        </View>

        {/* Support Section */}
        {renderSectionHeader(supportText)}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' }]}>
          {renderSettingItem({
            icon: 'help-outline',
            label: helpCenterText,
            onPress: () => navigation.navigate('HelpCenter'),
          })}
          {renderSettingItem({
            icon: 'email',
            label: contactSupportText,
            onPress: () => openEmail('support@caretrek.app'),
            isLast: true,
          })}
        </View>

        {/* About Section */}
        {renderSectionHeader(aboutText)}
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1A202C' : '#FFFFFF' }]}>
          {renderSettingItem({
            icon: 'privacy-tip',
            label: privacyPolicyText,
            onPress: () => navigation.navigate('PrivacyPolicy'),
          })}
          {renderSettingItem({
            icon: 'description',
            label: termsOfServiceText,
            onPress: () => navigation.navigate('TermsOfService'),
          })}
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: isDark ? '#A0AEC0' : '#718096' }]}>
              {versionText} 1.0.0
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { 
            backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#4A5568' : '#E2E8F0',
            marginTop: 20,
          }]}
          onPress={handleSignOut}
        >
          <View style={styles.signOutContent}>
            <MaterialIcons 
              name="logout" 
              size={24} 
              color="#E53E3E" 
              style={styles.signOutIcon} 
            />
            <Text style={[styles.signOutText, { color: '#E53E3E' }]}>
              {signOutText || 'Sign Out'}
            </Text>
          </View>
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color="#A0AEC0" 
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  // Profile Header Styles
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(79, 70, 229, 0.1)', // Primary color with 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4F46E5', // Default primary color
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContainer: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A202C',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutIcon: {
    marginRight: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#718096',
  },
  signOutButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53E3E',
  },
});

export default FamilySettingsScreen;
