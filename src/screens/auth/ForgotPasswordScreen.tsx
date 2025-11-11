import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/theme/ThemeContext';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{email?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendPasswordResetEmail } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const validateEmail = (email: string) => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
      return true;
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) return;
    
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(email);
      
      Alert.alert(
        'Email Sent',
        'Please check your inbox for the password reset link. If you don\'t see it, please check your spam folder.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SignIn', { role: 'senior' })
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Icon name="lock-reset" size={60} color={colors.primary} />
            </View>
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email and we'll send you a link to reset your password
          </Text>
          
          <View style={[
            styles.inputContainer, 
            errors.email && styles.inputError,
            { borderColor: colors.border }
          ]}>
            <Icon 
              name="email-outline" 
              size={20} 
              color={errors.email ? '#e74c3c' : colors.textSecondary} 
              style={styles.icon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>
          
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                backgroundColor: colors.primary,
                opacity: (!email || isLoading) ? 0.7 : 1
              }
            ]} 
            onPress={handleResetPassword}
            disabled={!email || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backToLogin}
            onPress={() => navigation.navigate('SignIn', { role: 'senior' })}
            disabled={isLoading}
          >
            <Icon name="arrow-left" size={20} color={colors.primary} />
            <Text style={[styles.backToLoginText, { color: colors.primary }]}>Back to Login</Text>
          </TouchableOpacity>
          
          <View style={styles.contactSupport}>
            <Text style={[styles.contactText, { color: colors.textSecondary }]}>
              Need help?{' '}
              <Text 
                style={[styles.contactLink, { color: colors.primary }]}
                onPress={() => {
                  // Handle contact support
                }}
              >
                Contact Support
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 0,
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactSupport: {
    marginTop: 32,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    textAlign: 'center',
  },
  contactLink: {
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
