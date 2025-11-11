import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FamilyStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { addFamilyMember } from '../../utils/familyKeyManager';
import { Ionicons } from '@expo/vector-icons';

type AddFamilyKeyScreenNavigationProp = NavigationProp<FamilyStackParamList, 'AddFamilyKey'>;

const AddFamilyKeyScreen = () => {
  const navigation = useNavigation<AddFamilyKeyScreenNavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [familyKey, setFamilyKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFamilyKey = async () => {
    if (!familyKey.trim()) {
      Alert.alert('Error', 'Please enter a valid family key');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      await addFamilyMember(user.id, familyKey.trim().toUpperCase());
      Alert.alert(
        'Success',
        'Successfully connected to family member!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error adding family member:', error);
      Alert.alert('Error', error.message || 'Failed to add family member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Ionicons 
          name="person-add" 
          size={60} 
          color={colors.primary} 
          style={styles.icon} 
        />
        
        <Text style={[styles.title, { color: colors.text }]}>
          Add Family Member
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the family key provided by your family member to connect with them
        </Text>

        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Enter family key"
            placeholderTextColor={colors.textSecondary}
            value={familyKey}
            onChangeText={setFamilyKey}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!loading}
            selectTextOnFocus
          />
          {familyKey ? (
            <TouchableOpacity 
              onPress={() => setFamilyKey('')}
              style={styles.clearButton}
              disabled={loading}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.button, 
            { 
              backgroundColor: colors.primary,
              opacity: familyKey.trim() && !loading ? 1 : 0.6
            }
          ]}
          onPress={handleAddFamilyKey}
          disabled={!familyKey.trim() || loading}
        >
          {loading ? (
            <Text style={styles.buttonText}>Connecting...</Text>
          ) : (
            <Text style={styles.buttonText}>Connect</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons 
            name="information-circle-outline" 
            size={20} 
            color={colors.primary} 
            style={styles.infoIcon} 
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Ask your family member to share their family key from their Share ID screen
          </Text>
        </View>
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
    borderRadius: 15,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  button: {
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AddFamilyKeyScreen;
