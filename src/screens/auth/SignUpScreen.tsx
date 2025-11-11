import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/theme/ThemeContext';

type UserRole = 'family' | 'senior';

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SignUp'>;

const SignUpScreen = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const role: UserRole = 'senior';
  const { signUp, loading } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(value)) {
          newErrors.password = 'Password must contain uppercase, number & special character';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'displayName':
        if (!value.trim()) {
          newErrors.displayName = 'Full name is required';
        } else {
          delete newErrors.displayName;
        }
        break;
        
      case 'phoneNumber':
        if (!value) {
          delete newErrors.phoneNumber;
        } else if (!/^[0-9+\-\s()]*$/.test(value)) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const validateForm = () => {
    const fields = ['email', 'password', 'confirmPassword', 'displayName'];
    let isValid = true;
    const newErrors = { ...errors };
    
    fields.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Call signUp with required parameters
      await signUp(
        formData.email,
        formData.password,
        formData.displayName,
        role
      );

      // Show success message and navigate to sign in
      Alert.alert(
        'Account Created',
        'Your account has been created successfully! Please sign in to continue.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to sign in screen
              navigation.navigate('SignIn', { role });
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <View style={[styles.iconContainer, { backgroundColor: '#4a90e220' }]}>
              <Icon name="account-plus" size={60} color="#4a90e2" />
            </View>
          </View>
          
          <View style={styles.form}>
          {/* Display Name */}
          <View style={[styles.inputContainer, errors.displayName && styles.inputError]}>
            <Icon name="account" size={20} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={formData.displayName}
              onChangeText={(text) => handleChange('displayName', text)}
              onBlur={() => validateField('displayName', formData.displayName)}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>
          {errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}
          
          {/* Email */}
          <View style={[styles.inputContainer, errors.email && styles.inputError, { marginTop: 16 }]}>
            <Icon name="email" size={20} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              onBlur={() => validateField('email', formData.email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          
          {/* Phone Number */}
          <View style={[styles.inputContainer, errors.phoneNumber && styles.inputError, { marginTop: 16 }]}>
            <Icon name="phone" size={20} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone Number (Optional)"
              placeholderTextColor={colors.textSecondary}
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              onBlur={() => validateField('phoneNumber', formData.phoneNumber)}
              keyboardType="phone-pad"
              editable={!isSubmitting}
            />
          </View>
          {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          
          {/* Password */}
          <View style={[styles.inputContainer, errors.password && styles.inputError, { marginTop: 16 }]}>
            <Icon name="lock" size={20} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              onBlur={() => validateField('password', formData.password)}
              secureTextEntry
              editable={!isSubmitting}
            />
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          {/* Confirm Password */}
          <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError, { marginTop: 16 }]}>
            <Icon name="lock-check" size={20} color={colors.textSecondary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              onBlur={() => validateField('confirmPassword', formData.confirmPassword)}
              secureTextEntry
              editable={!isSubmitting}
            />
          </View>
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          
          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              By creating an account, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
          
          {/* Sign Up Button */}
          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                backgroundColor: colors.primary,
                opacity: isSubmitting ? 0.7 : 1
              }
            ]}
            onPress={handleSignUp}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>
          
          {/* Social Login Options */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <Icon name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <Icon name="apple" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: colors.border }]}>
              <Icon name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
          </View>
          
          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignIn', { role: 'senior' })}
              disabled={isSubmitting}
            >
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
            disabled={isSubmitting}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 56,
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
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
  button: {
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
  termsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
