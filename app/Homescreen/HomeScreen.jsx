import { router } from 'expo-router';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Importing styles from the current directory
import styles from './HomeScreenStyles';

const HomeScreen = () => {
  
  // Function to route the user to the Login/Signup screen
  const handleAuthNavigation = () => {
    // *** CORRECTED PATH: Routes to app/Authentication/Login.jsx ***
    router.push('/Authentication/Signup'); 
  };
  const handleAuthNavigation2 = () => {
    // *** CORRECTED PATH: Routes to app/Authentication/Login.jsx ***
    router.push('/Authentication/Login'); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* --- 1. GEOMETRIC BACKGROUND ELEMENTS (RESTORED) --- */}
        <View style={styles.geometricShape1} />
        <View style={styles.geometricShape2} />

        {/* --- 2. Logo and Tagline --- */}
        <View style={styles.logoArea}>
            <Text style={styles.appLogo}>TaReview</Text>
            <Text style={styles.taglineText}>
              Master your subject material with personalized, AI-powered reviewers and quizzes.
            </Text>
        </View>

        {/* --- 3. Empty Central Space (REMOVE FLEX: 1 for central alignment) --- */}
        {/* <View style={{ flex: 1 }} /> */}


        {/* --- 4. CTA & Footer Links (BOTTOM) --- */}
        <View style={styles.footerContainer}>
            <TouchableOpacity
                style={styles.getStartedButton}
                onPress={handleAuthNavigation}
                activeOpacity={0.7} 
            >
                <Text style={styles.getStartedButtonText}>
                    Start Now
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAuthNavigation2}>
                <Text style={styles.footerLink}>
                    Already a user? {' '}
                    <Text style={styles.footerLinkAccent}>
                        Log In Here
                    </Text>
                </Text>
            </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;