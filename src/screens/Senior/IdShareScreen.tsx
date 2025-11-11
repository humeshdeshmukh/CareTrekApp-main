import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
  SafeAreaView,
  useWindowDimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../../contexts/AuthContext';

const IdShareScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const seniorId = user?.uid || 'Not Available';
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(seniorId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy ID to clipboard');
    }
  };

  const shareId = async () => {
    try {
      const message = `My CareTrek Senior ID is: ${seniorId}\n\nUse this ID to connect with me in the CareTrek app.`;
      const shareOptions = {
        message,
        title: 'My CareTrek Senior ID',
        ...(Platform.OS === 'android' && { subject: 'CareTrek Senior ID' }),
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing ID:', error);
      Alert.alert('Error', 'Failed to share ID. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Share Your ID
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* ID Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary, marginBottom: 32 }]}>
            Your Senior ID
          </Text>
          
          <View style={styles.idContainer}>
            <Text 
              style={[styles.idText, { color: colors.text }]}
              selectable
              selectionColor={colors.primary + '40'}
            >
              {seniorId}
            </Text>
            
            <TouchableOpacity 
              onPress={copyToClipboard}
              style={[styles.copyButton, { 
                backgroundColor: copied 
                  ? (colors.success || '#10B981') + '20' 
                  : colors.primary + '15'
              }]}
            >
              <MaterialCommunityIcons
                name={copied ? 'check' : 'content-copy'}
                size={20}
                color={copied ? (colors.success || '#10B981') : colors.primary}
              />
            </TouchableOpacity>
          </View>
          
          {copied && (
            <Text style={[styles.copiedText, { color: colors.success || '#10B981' }]}>
              Copied to clipboard!
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={shareId}
            >
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share ID</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginLeft: -32, // To center the title
  },
  headerRight: {
    width: 40,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
  },
  idText: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
    marginRight: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flex: 1,
    textAlign: 'center',
  },
  copyButton: {
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 24,
  },
});

export default IdShareScreen;
