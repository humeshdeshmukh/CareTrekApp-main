import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/auth/AuthContext';
import { RootStackParamList, AuthStackParamList } from '../../navigation/types';
import { Checkbox } from 'react-native-paper';

type SignInScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, error, clearError } = useAuth();
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Clear any previous errors when the component mounts
  useEffect(() => {
    clearError?.();
  }, []);

  // Handle sign in
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigation is handled by the auth state change in AppNavigator
    } catch (error) {
      console.error('Sign in error:', error);
      // Error is already set in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to forgot password screen
  const navigateToForgotPassword = () => {
    // @ts-ignore - Navigation type issue with nested navigators
    navigation.navigate('ForgotPassword', { email: email || '' });
  };

  // Navigate to sign up screen
  const navigateToSignUp = () => {
    // @ts-ignore - Navigation type issue with nested navigators
    navigation.navigate('SignUp', { role: 'senior' });
  };

  // Navigate back to auth selection
  const navigateBack = () => {
    navigation.goBack();
  };

  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
              <Icon name="arrow-left" size={24} color="#1E293B" />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Icon name="account-circle" size={60} color="#3B82F6" />
              </View>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.subtitle}>Please sign in to your account</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                textContentType="password"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Icon 
                  name={showPassword ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password */}
            <View style={styles.rememberForgotContainer}>
              <View style={styles.rememberMeContainer}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                  color="#3B82F6"
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </View>
              <TouchableOpacity onPress={navigateToForgotPassword}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Icon name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Icon name="apple" size={24} color="#000000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Icon name="facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignUp}>
                <Text style={[styles.linkText, styles.signUpLink]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DBEAFE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
    color: '#94A3B8',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1E293B',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#475569',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  forgotPasswordLink: {
    alignSelf: 'center',
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#94A3B8',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  signUpText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  signUpLink: {
    fontFamily: 'Poppins-SemiBold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});