export type SeniorTabParamList = {
  Home: undefined;
  Map: undefined;
  Health: undefined;
  Reminders: undefined;
  Profile: undefined;
};

export type FamilyTabParamList = {
  Dashboard: undefined;
  Map: undefined;
  Seniors: undefined;
  Messages: undefined;
  More: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  OTPVerification: {
    phoneNumber: string;
    verificationId: string;
    role: 'senior' | 'family';
    isSignUp: boolean;
  };
  EditProfile: undefined;
};

export type RootStackParamList = {
  RoleSelection: undefined;
  SeniorApp: undefined;
  FamilyApp: undefined;
  Auth: { screen: keyof AuthStackParamList };
  // Add other screens here
};
