import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator // Added for visual feedback during login attempt
    ,

    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// --- NEW IMPORT ---
// Adjust the path to your 'hooks' folder if necessary
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from '../../Services/useAuth';


// Import styles and COLORS
import styles, { COLORS } from './AuthStyles';

// Placeholder for Google Icon
const GoogleIconPlaceholder = () => <Text style={styles.googleIcon}>G</Text>;

// Assume your logo is located in the assets folder one level up from 'app'
const TaReviewLogo = require('../Pictures/logo.png');

// Import DB functions
import { getUserByAuthAccount, initDatabase } from '../../Services/Database';


const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false); // To disable button and show spinner

    // --- NEW LINE ---
    const { login } = useAuth(); // Access the global login function

    // Initialize database when login screen loads
    useEffect(() => {
        const loadDB = async () => {
            try {
                await initDatabase();
                console.log("Database initialized successfully (Login Screen).");
            } catch (e) {
                console.error("DB Init Error on Login:", e);
                Alert.alert("Database Error", "Failed to load local storage.");
            }
        };
        loadDB();
    }, []);


    // Standard Login Auth (UPDATED)
   // =======================
const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Login Failed", "Please enter both email and password.");
        return;
    }

    setIsAuthenticating(true);

    try {
        // 1. Authenticate user from DB
        const user = await getUserByAuthAccount(email, password);

        if (!user) {
            Alert.alert("Invalid Credentials", "Incorrect email or password.");
            setIsAuthenticating(false);
            return;
        }

        // 2. Save user in AuthContext
        login(user);

        // 3. ALSO save user in AsyncStorage for global access
        await AsyncStorage.setItem(
            "currentUser",
            JSON.stringify({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.authAccount,
            })
        );

        console.log("🔥 User saved to AsyncStorage:", user.id);

        Alert.alert("Welcome Back!", `Hello, ${user.firstName}!`);

        // 4. Navigate to dashboard
        router.replace('../Dashboard/Dashboard');

    } catch (err) {
        console.error("Login error:", err);
        Alert.alert("Error", "Something went wrong during login.");
    } finally {
        setIsAuthenticating(false);
    }
};


    // Google Sign-In Handler
    const handleGoogleSignIn = () => {
        console.log('Initiating Google Sign-In...');
    };

    // Function for navigation to Signup (Uses router.push)
    const navigateToSignup = () => {
        router.push('/Authentication/Signup');
    };

    const headerText = 'Login to TaReview!';
    const buttonText = 'Log In';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

                {/* --- Geometric Background Elements --- */}
                <View style={styles.geometricShape1} />
                <View style={styles.geometricShape2} />

                {/* --- Header (Image Logo) --- */}
                <View style={styles.header}>
                    <Image
                        source={TaReviewLogo}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                {/* --- Form Container (White Card) --- */}
                <View style={styles.formContainer}>

                    {/* --- Static Header Text --- */}
                    <Text style={styles.headerTitle}>Login to TaReview</Text>

                    {/* --- Email/Password Form --- */}
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={COLORS.text + '80'}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        editable={!isAuthenticating} // Disable input while logging in
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={COLORS.text + '80'}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        editable={!isAuthenticating} // Disable input while logging in
                    />

                    {/* Action Button: Log In (UPDATED) */}
                    <TouchableOpacity
                        style={[styles.actionButton, isAuthenticating && { opacity: 0.7 }]} // Apply opacity when disabled
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={isAuthenticating} // Disable while authenticating
                    >
                        {isAuthenticating ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.actionButtonText}>
                                {buttonText}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* --- Divider: OR --- */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* --- Google Sign-In Button --- */}
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleSignIn}
                        activeOpacity={0.8}
                        disabled={isAuthenticating}
                    >
                        <GoogleIconPlaceholder />
                        <Text style={styles.googleButtonText}>
                            Continue with Google
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Switch Mode Link (Go to Signup) --- */}
                <View style={styles.switchContainer}>
                    <TouchableOpacity onPress={navigateToSignup} disabled={isAuthenticating}>
                        <Text style={styles.switchText}>
                            Need an account? {' '}
                            <Text style={styles.switchLink}>
                                Sign Up
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;