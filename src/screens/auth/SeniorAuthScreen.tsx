import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList, UserRole } from '../../navigation/types';
import { useTheme } from '../../contexts/theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type SeniorAuthScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SeniorAuth'>;

const SeniorAuthScreen = () => {
  const navigation = useNavigation<SeniorAuthScreenNavigationProp>();
  const { colors } = useTheme();
  const { signIn, loading, user } = useAuth();
  
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
    phoneNumber?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Navigate to SeniorTabs in the root stack
      // @ts-ignore - SeniorTabs is in the root stack
      navigation.navigate('SeniorTabs');
    }
  }, [user, navigation]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/; // Simple 10-digit phone number validation

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Sign-up specific validations
    if (!isSignIn) {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (phoneNumber && !phoneRegex.test(phoneNumber)) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        await signIn(email, password, 'senior');
        // Navigation handled by useEffect when user state changes
      } else {
        // Navigate to SignUp screen through the Auth stack
        navigation.navigate('Auth', { 
          screen: 'SignUp',
          params: { 
            role: 'senior' as UserRole,
            email: email,
            name: name,
            phoneNumber: phoneNumber
          }
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address first');
      return;
    }
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Logo and Header */}
            <View style={styles.logoContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Icon 
                  name={isSignIn ? 'account' : 'account-plus'} 
                  size={60} 
                  color={colors.primary} 
                />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {isSignIn ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {isSignIn ? 'Sign in to continue to CareTrek' : 'Create your senior account to get started'}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {!isSignIn && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: colors.text,
                        borderColor: errors.name ? colors.error : colors.border,
                        backgroundColor: colors.card
                      }
                    ]}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                  {errors.name && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.name}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: colors.text,
                      borderColor: errors.email ? colors.error : colors.border,
                      backgroundColor: colors.card
                    }
                  ]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
                {errors.email && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {!isSignIn && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: colors.text,
                        borderColor: errors.phoneNumber ? colors.error : colors.border,
                        backgroundColor: colors.card
                      }
                    ]}
                    placeholder="Phone Number (Optional)"
                    placeholderTextColor={colors.textSecondary}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                  {errors.phoneNumber && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.phoneNumber}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: colors.text,
                      borderColor: errors.password ? colors.error : colors.border,
                      backgroundColor: colors.card
                    }
                  ]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {!isSignIn && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: colors.text,
                        borderColor: errors.confirmPassword ? colors.error : colors.border,
                        backgroundColor: colors.card
                      }
                    ]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                  {errors.confirmPassword && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
              )}

              {isSignIn && (
                <TouchableOpacity 
                  style={styles.forgotPasswordButton}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  <Text style={{ color: colors.primary, fontWeight: '500' }}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { 
                    backgroundColor: colors.primary,
                    opacity: loading ? 0.7 : 1,
                    shadowColor: colors.primary,
                    elevation: 3,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                  }
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isSignIn ? 'Sign In' : 'Continue'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { 
                    borderColor: colors.border,
                    backgroundColor: colors.card
                  }
                ]}
                onPress={() => {}}
                disabled={loading}
              >
                <Icon name="google" size={20} color={colors.text} />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>
                  {isSignIn ? 'Sign in with Google' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary }}>
                {isSignIn ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity 
                onPress={() => setIsSignIn(!isSignIn)}
                disabled={loading}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  {isSignIn ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginTop: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
  },
  forgotPasswordButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
  },
  dividerText: {
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SeniorAuthScreen;
