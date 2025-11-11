export type UserRole = 'family' | 'senior';

export type SignUpParams = {
  role: UserRole;
  email?: string;
  name?: string;
  phoneNumber?: string;
};

export type AuthStackParamList = {
  // Authentication Flow
  Welcome: undefined;
  FamilySignIn: { email?: string };
  SeniorAuth: { role?: UserRole };
  SignIn: { role?: UserRole };
  SignUp: SignUpParams;
  ForgotPassword: { email?: string };
  OTPVerification: { 
    phoneNumber: string;
    verificationId: string;
    role: UserRole;
    isSignUp?: boolean;
  };
  Emergency: { role: UserRole };
  EditProfile: undefined;
};

export type FamilyStackParamList = {
  // Family Home
  FamilyHome: undefined;
  
  // Family Features
  ShareId: undefined;
  AddFamilyKey: undefined;
  FamilyProfile: { userId: string };
  FamilySettings: undefined;
  
  // Senior Management
  SeniorList: undefined;
  SeniorDetails: { seniorId: string };
  AddSenior: undefined;
  
  // Alerts & Notifications
  Alerts: undefined;
  AlertDetails: { alertId: string };
  
  // Messages
  Messages: undefined;
  Chat: { recipientId: string };
};

export type SeniorStackParamList = {
  // Senior Home
  SeniorHome: undefined;
  
  // Health & Safety
  HealthDashboard: undefined;
  MedicationReminders: undefined;
  EmergencyContacts: undefined;
  
  // Profile & Settings
  SeniorProfile: undefined;
  SeniorSettings: undefined;
  
  // Help & Support
  HelpCenter: undefined;
  ContactSupport: undefined;
};


export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  
  // Main App Tabs
  MainTabs: undefined;
  
  // Shared Screens
  WebView: { url: string; title: string };
  
  // Common Screens
  Loading: undefined;
  NotFound: undefined;
  
  // Modal Screens
  ImageViewer: { uri: string };
  
  // Onboarding
  Onboarding: undefined;
  
  // Deep Linking
  DeepLink: { url: string };
} & AuthStackParamList & 
   Omit<FamilyStackParamList, keyof AuthStackParamList> & 
   Omit<SeniorStackParamList, keyof AuthStackParamList | keyof FamilyStackParamList>;

// Helper types for navigation props
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: (screen: T, params?: RootStackParamList[T]) => void;
    goBack: () => void;
    // Add other navigation methods as needed
  };
  route: {
    params: RootStackParamList[T];
    name: string;
    key: string;
  };
};
