import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store/store';
import { supabase } from '../supabaseConfig';
import { setUser, setLoading, setError, signInSuccess, signUpSuccess, signOutSuccess } from '../store/slices/authSlice';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Auth: undefined;
  Family: undefined;
  Senior: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { user, role, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  // Check user session on mount
  const checkSession = async () => {
    try {
      dispatch(setLoading(true));
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        const userData = {
          id: session.user.id,
          email: session.user.email,
          displayName: profile?.display_name || null,
          emailVerified: session.user.confirmed_at !== null,
          role: profile?.role || null,
          photoURL: profile?.avatar_url || null,
          phoneNumber: session.user.phone || null,
        };
        
        dispatch(setUser({ user: userData, role: profile?.role || null }));
      }
    } catch (error: any) {
      console.error('Session check error:', error);
      dispatch(signOutSuccess());
      router.replace('/auth/signin');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string, userRole: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error('No session returned after sign in');
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (profileError) throw profileError;
      
      // Verify role
      if (profile.role !== userRole) {
        await supabase.auth.signOut();
        throw new Error(`Please sign in as a ${userRole} user`);
      }
      
      const userData = {
        id: data.session.user.id,
        email: data.session.user.email,
        displayName: profile?.display_name || null,
        emailVerified: data.session.user.confirmed_at !== null,
        role: profile.role,
        photoURL: profile?.avatar_url || null,
        phoneNumber: data.session.user.phone || null,
      };
      
      dispatch(signInSuccess({ user: userData, role: profile.role }));
      
      // Redirect based on role
      navigation.reset({
        index: 0,
        routes: [{ name: profile.role === 'family' ? 'Family' : 'Senior' }],
      });
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      dispatch(setError(error.message || 'Failed to sign in'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string, userRole: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      });

      if (signUpError) throw signUpError;
      
      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              display_name: displayName,
              role: userRole,
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) throw profileError;
        
        const userData = {
          id: data.user.id,
          email: data.user.email,
          displayName,
          emailVerified: data.user.confirmed_at !== null,
          role: userRole,
        };
        
        dispatch(signUpSuccess({ user: userData, role: userRole }));
        
        // Redirect based on role
        navigation.reset({
        index: 0,
        routes: [{ name: userRole === 'family' ? 'Family' : 'Senior' }],
      });
      }
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      dispatch(setError(error.message || 'Failed to sign up'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      dispatch(setLoading(true));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      dispatch(signOutSuccess());
      router.replace('/auth/signin');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      dispatch(setError(error.message || 'Failed to sign out'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Send password reset email
  const sendPasswordResetEmail = async (email: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      dispatch(setError(error.message || 'Failed to send password reset email'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Update user profile
  const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    try {
      if (!user) throw new Error('No user is signed in');
      
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      // Update in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...(updates.displayName && { full_name: updates.displayName }),
          ...(updates.photoURL && { avatar_url: updates.photoURL }),
        },
      });
      
      if (authError) throw authError;
      
      // Update in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...(updates.displayName && { display_name: updates.displayName }),
          ...(updates.photoURL && { avatar_url: updates.photoURL }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update local state
      dispatch(updateProfile(updates));
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      dispatch(setError(error.message || 'Failed to update profile'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    role,
    isAuthenticated,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    checkSession,
  };
};
