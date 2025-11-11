import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/theme/ThemeContext';
import { supabase } from '../../lib/supabase';

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // permissive typing so this file works regardless of exact navigator shape you have
  const navigation = useNavigation<SignUpScreenNavigationProp & any>();
  const route = useRoute<any>();
  const role: 'family' | 'senior' = route?.params?.role ?? 'senior';

  const { colors } = useTheme();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) newErrors.email = 'Please enter a valid email';
        else delete newErrors.email;
        break;

      case 'password':
        if (!value) newErrors.password = 'Password is required';
        else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value))
          newErrors.password = 'Password must contain uppercase, number & special character';
        else delete newErrors.password;
        break;

      case 'confirmPassword':
        if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        else delete newErrors.confirmPassword;
        break;

      case 'displayName':
        if (!value.trim()) newErrors.displayName = 'Full name is required';
        else delete newErrors.displayName;
        break;

      case 'phoneNumber':
        // allow empty (optional) or digits + common phone symbols
        if (!value) delete newErrors.phoneNumber;
        else if (!/^[0-9+\-\s()]*$/.test(value)) newErrors.phoneNumber = 'Please enter a valid phone number';
        else delete newErrors.phoneNumber;
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // re-validate while typing if the field already had an error
    if (errors[name]) validateField(name, value);
  };

  const validateForm = () => {
    // ensure all required fields validated
    const required: Array<keyof typeof formData> = ['email', 'password', 'confirmPassword', 'displayName'];
    let ok = true;
    required.forEach(field => {
      const valid = validateField(field as string, formData[field]);
      if (!valid) ok = false;
    });
    return ok;
  };

  const handleForgotPassword = () => {
    // navigate to your ForgotPassword screen in the root stack (per your previous code)
    // using permissive typing so this works even if the screen is in a different navigator
    navigation.navigate('ForgotPassword' as any);
  };

  const handleSubmit = async () => {
    console.log('Starting signup process...');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting to sign up user with email:', formData.email);
      
      // First, sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            role: role,
            phone_number: formData.phoneNumber
          },
          // Skip email confirmation for now
          emailRedirectTo: undefined
        },
      });

      console.log('Signup response:', { authData, signUpError });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('No user data returned from sign up');
      }

      console.log('User created successfully, signing in...');
      
      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log('Sign in response:', { signInData, signInError });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      console.log('Creating profile in profiles table...');
      // Add to profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          display_name: formData.displayName,
          role: role,
          phone_number: formData.phoneNumber,
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('Profile creation response:', { profileData, profileError });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile: ' + profileError.message);
      }

      console.log('Creating user_profile record...');
      // Also create user_profile record
      const { data: userProfileData, error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          full_name: formData.displayName,
          updated_at: new Date().toISOString()
        })
        .select();

      console.log('User profile creation response:', { userProfileData, userProfileError });

      if (userProfileError) {
        console.error('User profile creation error:', userProfileError);
        // Don't throw here as the main account was created
      }

      console.log('Signup successful, navigating to home screen...');
      
      // Navigate to the appropriate home screen based on role
      const targetScreen = role === 'senior' ? 'SeniorHome' : 'FamilyHome';
      console.log('Navigating to:', targetScreen);
      navigation.navigate(targetScreen as any);
      
    } catch (error: any) {
      console.error('Signup error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
      
      let errorMessage = 'An error occurred while creating your account. Please try again.';
      
      if (error.message.includes('already registered') || error.message.includes('already in use')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.message.includes('password') || error.message?.toLowerCase().includes('password')) {
        errorMessage = 'Please choose a stronger password (min 6 characters)';
      } else if (error.message.includes('email') || error.message?.toLowerCase().includes('email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      console.log('Showing error to user:', errorMessage);
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      console.log('Signup process completed');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.logoContainer}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="account-heart" size={50} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                {role === 'family' ? 'Family Member Sign Up' : 'Senior Sign Up'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Create your account to get started
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.displayName ? colors.error : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.displayName}
                  onChangeText={value => handleChange('displayName', value)}
                  onBlur={() => validateField('displayName', formData.displayName)}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
                {errors.displayName && (
                  <Text style={[styles.error, { color: colors.error }]}>{errors.displayName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.email ? colors.error : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.email}
                  onChangeText={value => handleChange('email', value)}
                  onBlur={() => validateField('email', formData.email)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
                {errors.email && <Text style={[styles.error, { color: colors.error }]}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.password ? colors.error : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.password}
                  onChangeText={value => handleChange('password', value)}
                  onBlur={() => validateField('password', formData.password)}
                  secureTextEntry
                  editable={!isSubmitting}
                />
                {errors.password && (
                  <Text style={[styles.error, { color: colors.error }]}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.confirmPassword ? colors.error : colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.confirmPassword}
                  onChangeText={value => handleChange('confirmPassword', value)}
                  onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
                  secureTextEntry
                  editable={!isSubmitting}
                />
                {errors.confirmPassword && (
                  <Text style={[styles.error, { color: colors.error }]}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                    opacity: isSubmitting ? 0.7 : 1,
                    marginTop: 24,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity 
                style={[styles.socialButton, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 16
                }]}
                onPress={() => {}}
                disabled={isSubmitting}
              >
                <Icon name="google" size={20} color={colors.text} />
                <Text style={[styles.socialButtonText, { 
                  color: colors.text,
                  marginLeft: 12,
                  fontSize: 16,
                  fontWeight: '500'
                }]}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')} disabled={isSubmitting}>
                  <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
                </TouchableOpacity>
              </View>

              {/* Terms
              <View style={styles.termsContainer}>
                <Text style={[styles.termsText, { color: colors.textSecondary }]}>
                  By creating an account, you agree to our{' '}
                  <Text style={[styles.linkText, { color: colors.primary }]}>Terms of Service</Text> and{' '}
                  <Text style={[styles.linkText, { color: colors.primary }]}>Privacy Policy</Text>
                </Text>
              </View> */}
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
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;
