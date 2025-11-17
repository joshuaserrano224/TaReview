import { Stack } from 'expo-router';

// 1. Import the AuthProvider from your hooks directory
// Adjust the path (e.g., '../../hooks/useAuth') if your 'hooks' folder is nested differently.
import { AuthProvider } from '../Services/useAuth';

// 2. Import the recommended SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';


// This layout controls the navigation stack for all screens
// inside the 'app/Authentication' folder.

export default function AuthLayout() {
  return (
    // Step A: Wrap the entire layout in SafeAreaProvider
    <SafeAreaProvider>
      {/* Step B: Wrap the navigation stack with the AuthProvider.
        This makes 'useAuth()' available to all screens inside this stack,
        including LoginScreen.jsx.
      */}
      <AuthProvider>
        <Stack
          screenOptions={{
            // This is the core instruction to hide the header bar for ALL Auth screens
            headerShown: false,
          }}
        >
          {/* All screens in the Authentication folder (Login, Signup, etc.) are children here */}
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}