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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

type SeniorAuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SeniorAuth'>;

const SeniorAuthScreen: React.FC = () => {
  // permissive navigation typing to avoid TS errors if your root stack differs
  const navigation = useNavigation<SeniorAuthScreenNavigationProp & any>();
  const { colors } = useTheme();
  const { signIn, loading, user } = useAuth();

  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    name?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      // Navigate to SeniorTabs in the root stack
      navigation.navigate('SeniorTabs' as any);
    }
  }, [user, navigation]);

  // Toggle between sign in and sign up forms
  const toggleAuthMode = () => {
    setIsSignIn(prev => !prev);
    // Reset form and switch to sign in
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setIsSignIn(true);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        if (!value) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) newErrors.email = 'Please enter a valid email';
        else delete newErrors.email;
        break;

      case 'password':
        if (!value) newErrors.password = 'Password is required';
        else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value))
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        else delete newErrors.password;
        break;

      case 'confirmPassword':
        if (value !== password) newErrors.confirmPassword = 'Passwords do not match';
        else delete newErrors.confirmPassword;
        break;

      case 'name':
        if (!value.trim()) newErrors.name = 'Name is required';
        else delete newErrors.name;
        break;

      default:
        break;
    }

    setErrors(newErrors);
    // return true if there's no error for this field
    return !newErrors[field as keyof typeof newErrors];
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    // Email
    if (!email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(email)) newErrors.email = 'Please enter a valid email';

    // Password
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';

    if (!isSignIn) {
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!name.trim()) newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isSignIn) {
        await signIn(email, password, 'senior');
        // actual navigation occurs in the useEffect when `user` is set
        return;
      }

      // Sign up flow with Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name,
            role: 'senior'
          },
          emailRedirectTo: 'caretrek://login-callback',
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData?.user) {
        throw new Error('No user data returned from sign up');
      }

      // Show success message and reset form
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account. You can sign in after verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and switch to sign in
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setName('');
              setPhoneNumber('');
              setIsSignIn(true);
            },
          },
        ]
      );

      // The database trigger will handle creating the profile and senior records
      // No need for manual profile/senior creation here
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setErrors({});
    } catch (err: any) {
      console.error('Authentication error:', err);
      let errorMessage = 'An error occurred. Please try again.';

      const em = String(err?.message || err);

      if (em.includes('already registered') || em.includes('already in use') || em.includes('unique')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (em.includes('password')) {
        errorMessage = 'Please choose a stronger password (min 8 characters).';
      } else if (em.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (em.includes('row-level security')) {
        errorMessage = 'Permission denied. Please contact support.';
      }

      Alert.alert('Error', errorMessage);
      // cleanup partial auth if any
      await supabase.auth.signOut();
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as any, { email });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.logoContainer, { marginBottom: 30 }]}>
              <Icon name="account" size={80} color={colors.primary} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{isSignIn ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{isSignIn ? 'Sign in to continue to CareTrek' : 'Create your senior account to get started'}</Text>

            <View style={styles.formContainer}>
              {!isSignIn && (
                <View style={styles.inputBlock}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: errors.name ? colors.error : colors.border, backgroundColor: colors.card }]}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                    onBlur={() => validateField('name', name)}
                  />
                  {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text> : null}
                </View>
              )}

              <View style={styles.inputBlock}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: errors.email ? colors.error : colors.border, backgroundColor: colors.card }]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                  onBlur={() => validateField('email', email)}
                />
                {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text> : null}
              </View>

<View style={styles.inputBlock}>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: errors.password ? colors.error : colors.border, backgroundColor: colors.card }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                  onBlur={() => validateField('password', password)}
                />
                {errors.password ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text> : null}
              </View>

              {!isSignIn && (
                <View style={styles.inputBlock}>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: errors.confirmPassword ? colors.error : colors.border, backgroundColor: colors.card }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                    onBlur={() => validateField('confirmPassword', confirmPassword)}
                  />
                  {errors.confirmPassword ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text> : null}
                </View>
              )}

              {isSignIn && (
                <TouchableOpacity style={[styles.forgotPasswordButton, { borderColor: colors.primary }]} onPress={handleForgotPassword} disabled={loading}>
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
                  },
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isSignIn ? 'Sign In' : 'Continue'}</Text>}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => {}} disabled={loading}>
                <Icon name="google" size={20} color={colors.text} />
                <Text style={[styles.socialButtonText, { color: colors.text }]}>{isSignIn ? 'Sign in with Google' : 'Continue with Google'}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary }}>{isSignIn ? "Don't have an account? " : 'Already have an account? '}</Text>
              <TouchableOpacity onPress={toggleAuthMode} disabled={loading}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{isSignIn ? 'Sign Up' : 'Sign In'}</Text>
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
  inputBlock: {
    marginBottom: 12,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  submitButton: {
    marginTop: 18,
    padding: 14,
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
    marginTop: 18,
    marginBottom: 12,
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
    padding: 14,
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
    marginTop: 20,
  },
});

export default SeniorAuthScreen;
