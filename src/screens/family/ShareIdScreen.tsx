import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getFamilyKey } from '../../utils/familyKeyManager';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const ShareIdScreen = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [familyKey, setFamilyKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFamilyKey = async () => {
      if (user?.id) {
        try {
          const key = await getFamilyKey(user.id);
          setFamilyKey(key);
        } catch (error) {
          console.error('Error loading family key:', error);
          Alert.alert('Error', 'Failed to load family key');
        } finally {
          setLoading(false);
        }
      }
    };

    loadFamilyKey();
  }, [user]);

  const handleCopyKey = async () => {
    if (familyKey) {
      await Clipboard.setStringAsync(familyKey);
      Alert.alert('Copied!', 'Family key copied to clipboard');
    }
  };

  const handleShareKey = async () => {
    if (!familyKey) return;

    try {
      await Share.share({
        message: `Join my family on CareTrek! Use this key to connect with me: ${familyKey}`,
        title: 'CareTrek Family Key',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share family key');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.card}>
        <Ionicons name="people" size={60} color={colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>Your Family Key</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Share this key with family members so they can connect with you
        </Text>

        <View style={styles.keyContainer}>
          <Text style={[styles.keyText, { color: colors.primary }]}>{familyKey || 'No key generated'}</Text>
          <TouchableOpacity onPress={handleCopyKey} style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleShareKey}
          disabled={!familyKey}
        >
          <Ionicons name="share-social-outline" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share Key</Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: colors.textSecondary }]}>
          This key is permanent and will not change. Keep it safe and only share with trusted family members.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginRight: 10,
  },
  copyButton: {
    padding: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ShareIdScreen;
