import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';

const ProfileScreen = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Reset navigation to prevent going back to authenticated screens
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthSelection' }],
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteAccount();
              navigation.reset({
                index: 0,
                routes: [{ name: 'AuthSelection' }],
              });
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const profileItems = [
    { icon: 'account', label: 'Name', value: user?.displayName || 'Not set' },
    { icon: 'email', label: 'Email', value: user?.email || 'Not set' },
    { icon: 'phone', label: 'Phone', value: user?.phoneNumber || 'Not set' },
    { icon: 'account-group', label: 'Role', value: user?.role || 'Senior' },
    { 
      icon: 'identifier', 
      label: 'User ID', 
      value: user?.uid ? `ID: ${user.uid.substring(0, 8)}...` : 'Not available',
      copyable: true
    },
  ];

  const handleCopyToClipboard = (text: string) => {
    // Implement clipboard functionality
    // You'll need to install and import @react-native-clipboard/clipboard
    // Clipboard.setString(text);
    Alert.alert('Copied!', 'User ID has been copied to clipboard.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
            <Icon name="account" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.displayName || 'User'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Personal Information</Text>
          {profileItems.map((item, index) => (
            <View key={index} style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Icon name={item.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <View style={styles.valueContainer}>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{item.value}</Text>
                  {item.copyable && (
                    <TouchableOpacity 
                      onPress={() => handleCopyToClipboard(user?.uid || '')}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.settingIcon}>
              <Icon name="account-edit" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Icon name="bell" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Icon name="shield-account" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
            <Icon name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Icon name="logout" size={20} color={colors.danger} style={styles.actionButtonIcon} />
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>
              {isLoading ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <Icon name="delete" size={20} color={colors.danger} style={styles.actionButtonIcon} />
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  actionButtonsContainer: {
    margin: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
