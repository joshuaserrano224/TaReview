// app\Authentication\Signup.jsx (SignupScreen)

import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Import database service functions
import { initDatabase, insertUser } from '../../Services/Database'; // Imports remain correct

// Mock router (Assuming you are using Expo Router or a similar system)
const router = {
    replace: (path) => console.log(`[Navigation Mock] Replacing route with: ${path}`),
    push: (path) => console.log(`[Navigation Mock] Pushing route: ${path}`),
};

// Import styles and COLORS (Assuming these are defined elsewhere)
import styles, { COLORS } from './AuthStyles';
// IMPORT THE CUSTOM PICKER
import CustomPicker from './CustomPicker';

// Logo and Icon placeholders
const GoogleIconPlaceholder = () => <Text style={styles.googleIcon}>G</Text>;
const TaReviewLogo = require('../Pictures/logo.png');

// --- STEP DEFINITION ---
const STEP = {
    NAME_INFO: 1,
    FIELD_LEVEL: 2,
    CONTACT_INFO: 3,
    PASSWORD_INFO: 4,
};

// --- DATA FOR DROPDOWNS ---
const FIELD_OPTIONS = [
    { label: 'Select Field...', value: '' }, 
    { label: 'STEM (Science, Tech, Eng, Math)', value: 'STEM' },
    { label: 'HUMSS (Humanities & Social Sciences)', value: 'HUMSS' },
    { label: 'ABM (Accountancy, Business, Management)', value: 'ABM' },
    { label: 'General Academics', value: 'GAS' },
    { label: 'Other / Undecided', value: 'OTHER' },
];

const LEVEL_OPTIONS = [
    { label: 'Select Level...', value: '' }, 
    { label: 'High School', value: 'HS' },
    { label: 'Senior High School', value: 'SHS' },
    { label: 'College', value: 'COLLEGE' },
    { label: 'Post-Graduate', value: 'POST_GRAD' },
];
// --- END DATA ---


const SignupScreen = () => {
    // --- State Management ---
    const [currentStep, setCurrentStep] = useState(STEP.NAME_INFO);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [authAccount, setAuthAccount] = useState(''); // Mobile or Email
    const [password, setPassword] = useState('');
    const [fieldOfInterest, setFieldOfInterest] = useState(FIELD_OPTIONS[0].value);
    const [schoolLevel, setSchoolLevel] = useState(LEVEL_OPTIONS[0].value);
    // --- End State Management ---

    // --- Database Initialization on Load (FIXED DB CALL IS IN DATABASE.JSX) ---
   useEffect(() => {
    const loadDB = async () => {
        try {
            await initDatabase();
            console.log("Database initialized successfully.");
        } catch (err) {
            console.error("Database initialization error:", err);
            Alert.alert(
                "Database Error",
                "Failed to start local storage. Please restart the app."
            );
        }
    };

    loadDB();
}, []);

    // --- End Database Initialization ---


    // --- Navigation Handlers ---
    const handleNext = () => {
        // Validation now uses Alert
        if (currentStep === STEP.NAME_INFO && (!firstName || !lastName)) {
             Alert.alert("Validation Error", "Please enter your first and last name.");
             return;
        }
        // VALIDATION: Ensures values are selected before moving on from Step 2
        if (currentStep === STEP.FIELD_LEVEL && (!fieldOfInterest || fieldOfInterest === '' || !schoolLevel || schoolLevel === '')) {
             Alert.alert("Validation Error", "Please select both field of interest and school level.");
             return;
        }
        if (currentStep === STEP.CONTACT_INFO && !authAccount) {
             Alert.alert("Validation Error", "Please enter your mobile number or email.");
             return;
        }

        // Move to the next step
        if (currentStep < STEP.PASSWORD_INFO) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > STEP.NAME_INFO) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    // --- Final Submission Handler (UPDATED FOR DB) ---
    const handleSignup = async () => {
        if (!password) {
            Alert.alert("Validation Error", "Please set a password.");
            return;
        }
        
        // Data object to be saved
        const userData = {
            firstName,
            lastName,
            authAccount,
            password,
            fieldOfInterest,
            schoolLevel,
            signupDate: new Date().toISOString(), 
        };

        try {
            // 1. Insert the user into the SQLite database
            const newUserId = await insertUser(userData);

            // 2. Success Feedback
            console.log(`User signed up and saved locally with ID: ${newUserId}`);
            Alert.alert("Success! 🎉", "Your account has been created successfully and saved locally. You can now log in.");

            // 3. Navigation
            router.push('/Authentication/Login');
            
        } catch (error) {
            // 4. Handle Errors (e.g., duplicate account)
            let errorMessage = "An unknown error occurred during signup.";
            
            // Check for the specific error message generated in Database.jsx
            if (error.message && error.message.includes("already in use")) {
                 errorMessage = "That email/mobile is already registered. Please log in or use a different one.";
            } else {
                 console.error("Signup failed:", error);
                 errorMessage = `Signup failed: ${error.message || "Please try again."}`;
            }

            Alert.alert("Signup Failed", errorMessage);
        }
    };
    // --- End Final Submission Handler ---


    const handleGoogleSignIn = () => {
        console.log('Initiating Google Sign-In...');
    };

    const navigateToLogin = () => {
        router.replace('/Authentication/Login');
    };
    // --- End Navigation Handlers ---


    // --- Step Rendering Functions ---
    const renderStepNameInfo = () => (
        <>
            <Text style={styles.headerTitle}>What's your name?</Text>
            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={COLORS.text + '80'}
                autoCapitalize="words"
                value={firstName}
                onChangeText={setFirstName}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={COLORS.text + '80'}
                autoCapitalize="words"
                value={lastName}
                onChangeText={setLastName}
            />
        </>
    );

    const renderStepFieldLevel = () => (
        <>
            <Text style={styles.headerTitle}>Tell us about your studies</Text>
            
            <CustomPicker
                label="Field of Interest"
                placeholder="Select Field..."
                options={FIELD_OPTIONS} 
                selectedValue={fieldOfInterest}
                onValueChange={setFieldOfInterest}
            />

            <CustomPicker
                label="School Level"
                placeholder="Select Level..."
                options={LEVEL_OPTIONS} 
                selectedValue={schoolLevel}
                onValueChange={setSchoolLevel}
            />
        </>
    );

    const renderStepContactInfo = () => (
        <>
            <Text style={styles.headerTitle}>How can we reach you?</Text>
            <Text style={styles.label}>Mobile Number or Email</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., you@example.com or 09123456789"
                placeholderTextColor={COLORS.text + '80'}
                autoCapitalize="none"
                value={authAccount}
                onChangeText={setAuthAccount}
            />
        </>
    );

    const renderStepPasswordInfo = () => (
        <>
            <Text style={styles.headerTitle}>Choose a password</Text>
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Choose a strong password"
                placeholderTextColor={COLORS.text + '80'}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {/* Final Sign Up Button */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSignup} 
                activeOpacity={0.8}
            >
                <Text style={styles.actionButtonText}>
                    Sign Up
                </Text>
            </TouchableOpacity>
        </>
    );
    // --- End Step Rendering Functions ---


    const renderCurrentStep = () => {
        switch (currentStep) {
            case STEP.NAME_INFO:
                return renderStepNameInfo();
            case STEP.FIELD_LEVEL:
                return renderStepFieldLevel();
            case STEP.CONTACT_INFO:
                return renderStepContactInfo();
            case STEP.PASSWORD_INFO:
                return renderStepPasswordInfo();
            default:
                return null;
        }
    };

    const isLastStep = currentStep === STEP.PASSWORD_INFO;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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

                    {/* --- Step Indicator (e.g., 2/4) --- */}
                    <Text style={styles.stepIndicator}>
                        Step {currentStep} of {Object.keys(STEP).length}
                    </Text>

                    {/* --- Form Container (White Card) --- */}
                    <View style={styles.formContainer}>
                        
                        {/* --- RENDER CURRENT STEP CONTENT --- */}
                        {renderCurrentStep()}
                        
                        {/* --- Navigation Buttons (Skip if on the final step) --- */}
                        {!isLastStep && (
                            <View style={styles.stepNavigationContainer}>
                                {/* Back button visibility control */}
                                {currentStep > STEP.NAME_INFO && (
                                    <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={handleBack}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.backButtonText}>Back</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.nextButton,
                                        // Centers the next button if there is no back button
                                        currentStep === STEP.NAME_INFO && { marginLeft: 'auto' }
                                    ]}
                                    onPress={handleNext}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.nextButtonText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        )}


                        {/* --- Only show Google/Switch Link on the first step --- */}
                        {currentStep === STEP.NAME_INFO && (
                            <>
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
                                >
                                    <GoogleIconPlaceholder />
                                    <Text style={styles.googleButtonText}>
                                        Continue with Google
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* --- Switch Mode Link (Only show on the first step) --- */}
                    {currentStep === STEP.NAME_INFO && (
                        <View style={styles.switchContainer}>
                            <TouchableOpacity onPress={navigateToLogin}>
                                <Text style={styles.switchText}>
                                    Already a user? {' '}
                                    <Text style={styles.switchLink}>
                                        Log In
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignupScreen;