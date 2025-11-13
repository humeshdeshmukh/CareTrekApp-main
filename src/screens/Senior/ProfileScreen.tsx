import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useAuth } from '../../contexts/auth/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type ProfileItem = {
  icon: string;
  label: string;
  value: string;
  copyable?: boolean;
  action: () => void;
};

const ProfileScreen: React.FC = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use a permissive navigation type for now to avoid TS errors.
  // Replace `any` with your Stack type (e.g. StackNavigationProp<RootStackParamList, 'Profile'>) if available.
  const navigation = useNavigation<any>();

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Replace with real refresh logic if needed
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard', error);
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Navigate to WelcomeScreen and reset the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteAccount();
              // Navigate to WelcomeScreen after account deletion
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const profileItems: ProfileItem[] = [
    {
      icon: 'account',
      label: 'Name',
      value: user?.displayName || 'Not set',
      action: () => navigation.navigate('Auth', { screen: 'EditProfile' }),
    },
    {
      icon: 'email',
      label: 'Email',
      value: user?.email || 'Not set',
      action: () => {},
    },
    {
      icon: 'phone',
      label: 'Phone',
      value: user?.phoneNumber || 'Not set',
      action: () => {},
    },
    {
      icon: 'account-group',
      label: 'Role',
      value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Senior',
      action: () => {},
    },
    {
      icon: 'identifier',
      label: 'User ID',
      value: user?.id ? user.id : 'Not available',
      copyable: true,
      action: () => {},
    },
  ];

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark || colors.primary]}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.card }]}>
            <Icon name="account" size={60} color={colors.primary} />
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: `${colors.background}80` }]}
            onPress={() => navigation.navigate('Auth', { screen: 'EditProfile' })}
          >
            <Icon name="pencil" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.name, { color: colors.background }]}>{user?.displayName || 'User'}</Text>
          <Text style={[styles.email, { color: `${colors.background}CC` }]}>{user?.email || ''}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderProfileInfo = () => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Personal Information</Text>

      {profileItems.map((item, index) => (
        <TouchableOpacity
          key={item.label}
          style={[
            styles.detailItem,
            index !== profileItems.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border ? `${colors.border}40` : 'rgba(0,0,0,0.08)',
            },
          ]}
          onPress={item.action}
          activeOpacity={0.7}
        >
          <View style={styles.detailContent}>
            <View style={styles.detailLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                <Icon name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
                  {item.value}
                </Text>
              </View>
            </View>

            {item.copyable ? (
              <TouchableOpacity
                onPress={() => item.value !== 'Not available' && copyToClipboard(item.value)}
                style={styles.copyButton}
                disabled={item.value === 'Not available'}
              >
                <Icon name={copied ? 'check' : 'content-copy'} size={20} color={copied ? (colors.success || '#4CAF50') : colors.primary} />
              </TouchableOpacity>
            ) : (
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            )}
          </View>

          {item.copyable && copied && (
            <Text style={[styles.copiedText, { color: colors.success || '#4CAF50' }]}>Copied to clipboard!</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={[styles.card, { backgroundColor: colors.card, marginTop: 16 }]}>
      <TouchableOpacity
        style={[styles.actionButton, { borderBottomWidth: 1, borderBottomColor: colors.border ? `${colors.border}40` : 'rgba(0,0,0,0.08)' }]}
        onPress={() => navigation.navigate('Settings', { screen: 'SettingsMain' })}
      >
        <View style={styles.actionButtonContent}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Icon name="translate" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Language</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { borderBottomWidth: 1, borderBottomColor: colors.border ? `${colors.border}40` : 'rgba(0,0,0,0.08)' }]}
        onPress={() => navigation.navigate('Auth', { screen: 'EditProfile' })}
      >
        <View style={styles.actionButtonContent}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Icon name="account-edit" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Edit Profile</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleSignOut} disabled={isLoading}>
        <View style={styles.actionButtonContent}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.warning || '#FFA000'}15` }]}>
            <Icon name="logout" size={20} color={colors.warning || '#FFA000'} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.warning || '#FFA000' }]}>{isLoading ? 'Signing Out...' : 'Sign Out'}</Text>
        </View>
        {isLoading ? <ActivityIndicator size="small" color={colors.warning || '#FFA000'} /> : <Icon name="chevron-right" size={20} color={colors.textSecondary} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { borderTopWidth: 1, borderTopColor: colors.border ? `${colors.border}40` : 'rgba(0,0,0,0.08)' }]}
        onPress={handleDeleteAccount}
        disabled={isLoading}
      >
        <View style={styles.actionButtonContent}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.danger || '#F44336'}15` }]}>
            <Icon name="delete" size={20} color={colors.danger || '#F44336'} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.danger || '#F44336' }]}>Delete Account</Text>
        </View>
        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        {renderProfileHeader()}

        <View style={styles.content}>
          {renderProfileInfo()}
          {renderActionButtons()}

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>CareTrek v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 64 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: -20,
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  userInfo: { alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 16, opacity: 0.9 },
  content: { flex: 1, padding: 16, paddingTop: 0 },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  detailItem: { paddingVertical: 12 },
  detailContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailLabel: { fontSize: 13, marginBottom: 2 },
  detailValue: { fontSize: 16, fontWeight: '500', maxWidth: '90%' },
  copyButton: { padding: 8, marginLeft: 8 },
  copiedText: { fontSize: 12, marginTop: 4, textAlign: 'right' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 4 },
  actionButtonContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionButtonText: { fontSize: 16, fontWeight: '500' },
  versionText: { textAlign: 'center', marginTop: 24, marginBottom: 40, fontSize: 12, opacity: 0.6 },
});

export default ProfileScreen;
