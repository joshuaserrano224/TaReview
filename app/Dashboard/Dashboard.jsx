import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// --- IMPORTS ---
// Adjust path to your Auth hook based on your file structure (image_83eb47.png suggests Services folder)
import { useAuth } from '../../Services/useAuth';
// Import new styles
import styles, { THEME_COLORS } from './DashboardStyles';

// --- ICON & NAVIGATION CONFIGURATION ---
const TABS = {
    Home: { icon: 'home-outline', activeIcon: 'home', label: 'Dashboard' },
    Reviewer: { icon: 'book-outline', activeIcon: 'book', label: 'Reviewer' },
    Quiz: { icon: 'help-circle-outline', activeIcon: 'help-circle', label: 'Quiz' },
    Profile: { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
};

// --- Reusable Feature Card Component ---
const FeatureCard = ({ title, icon, color, onPress, subtitle }) => (
    <TouchableOpacity 
        style={[styles.card, { borderLeftColor: color }]} 
        onPress={onPress}
    >
        {/* Icon is now colored with the Accent Brown for visual consistency */}
        <Ionicons name={icon} size={30} color={THEME_COLORS.AccentBrown} />
        <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle || 'Start Generating'}</Text>
        </View>
    </TouchableOpacity>
);

// --- CONTENT PAGES ---

const HomeScreen = ({ navigate, currentUser }) => (
    <ScrollView contentContainerStyle={styles.contentPadding}>
        {/* Updated Welcome Header is the first element in the scrollable view */}
        <Text style={{ fontSize: 22, fontWeight: '700', color: THEME_COLORS.PrimaryText, marginTop: 0 }}>
            Good morning, {currentUser?.firstName || 'User'}!
        </Text>
        <Text style={styles.subtitle}>
            Ready to tackle your study materials?
        </Text>

        {/* Feature Cards Section (Improved spacing) */}
        <View style={styles.featureContainer}>
            <FeatureCard 
                title="Generate Reviewer"
                icon="document-text-outline"
                color={THEME_COLORS.PrimaryBrown}
                subtitle="From notes to guide"
                onPress={() => navigate('Reviewer')}
            />
            <FeatureCard 
                title="Create a Quiz"
                icon="bulb-outline"
                color={THEME_COLORS.AccentBrown}
                subtitle="Test your knowledge"
                onPress={() => navigate('Quiz')}
            />
        </View>

        {/* Quick Access List (Improved spacing) */}
        <Text style={styles.sectionHeader}>Your Progress</Text>
        <TouchableOpacity style={styles.quickAccessItem}>
            <Feather name="bar-chart-2" size={20} color={THEME_COLORS.AccentBrown} />
            <Text style={styles.quickAccessText}>Quiz History & Scores</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessItem}>
            <Feather name="folder" size={20} color={THEME_COLORS.AccentBrown} />
            <Text style={styles.quickAccessText}>Saved Review Guides</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAccessItem}>
            <Feather name="clock" size={20} color={THEME_COLORS.AccentBrown} />
            <Text style={styles.quickAccessText}>Recent Activity Log</Text>
        </TouchableOpacity>
        
    </ScrollView>
);

const ReviewerGenerator = () => (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentPadding}>
        <Text style={styles.sectionHeader}>Generate Reviewer</Text>
        <Text style={styles.subtitle}>
            Paste your lecture notes, documents, or topics below, and we'll transform them into a comprehensive review guide.
        </Text>
        
        <View style={styles.formArea}>
            <Text style={styles.formText}>[Input area for notes/text goes here]</Text>
            <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Analyze & Generate Reviewer</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
);

const QuizGenerator = () => (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentPadding}>
        <Text style={styles.sectionHeader}>Create a Quiz</Text>
        <Text style={styles.subtitle}>
            Turn any source text into multiple-choice or true/false questions, complete with answers and explanations.
        </Text>
        
        <View style={styles.formArea}>
            <Text style={styles.formText}>[Input area for content source goes here]</Text>
            <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Generate Quiz Questions</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
);

const ProfileScreen = () => {
    // We assume currentUser now contains firstName, lastName, authAccount, and signupDate
    const { currentUser, logout, isLoading } = useAuth();
    
    // Helper function to format date from the messy string into MM/DD/YYYY
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        
        // Try to parse the date. Handles formats like 'YYYY-MM-DD' and the messy one from the screenshot.
        try {
            // Remove everything after the date part if it's the ISO format
            const cleanDateString = dateString.split('T')[0]; 
            const date = new Date(cleanDateString);

            // If the date is invalid, try parsing the full messy string (for robustness)
            if (isNaN(date.getTime())) {
                const dateParts = dateString.match(/(\d{1,2})\/(\d{1,2})T.*\/(\d{4})/);
                if (dateParts && dateParts.length === 4) {
                    // Reconstruct from 11/16.../2025 parts
                    return `${dateParts[1].padStart(2, '0')}/${dateParts[2].padStart(2, '0')}/${dateParts[3]}`;
                }
            }
            
            // Standard Date object formatting for YYYY-MM-DD format
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();

            // Check if the date is valid and format it
            if (!isNaN(date.getTime()) && year > 1900) {
                return `${month}/${day}/${year}`;
            }
            
        } catch (e) {
            // Fallback for any parsing error
            console.error("Date parsing failed:", e);
        }
        
        return 'N/A';
    };

    // Determine the label (Email or Phone Number)
    const authAccountValue = currentUser?.authAccount || 'N/A';
    const authAccountLabel = authAccountValue.includes('@') ? 'Email' : 'Phone Number';

    // Construct the full name, ensuring a default if all parts are missing
    const fullName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Logged In User';
    
    // NOTE: userId declaration has been removed as it is no longer used
    
    // Format the date using the new function
    const formattedSignupDate = formatDate(currentUser?.signupDate);

    return (
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentPadding}>
            <Text style={styles.sectionHeader}>User Profile</Text>
            <View style={styles.profileBox}>
                <Ionicons name="person-circle-outline" size={80} color={THEME_COLORS.AccentBrown} />
                
                {/* DISPLAY FULL NAME */}
                <Text style={styles.profileName}>{fullName}</Text>
                
                {/* DISPLAY AUTH ACCOUNT (Email or Phone Number) */}
                <Text style={styles.profileDetail}>{authAccountLabel}: {authAccountValue}</Text>
                
                {/* DISPLAY SIGNUP DATE - Now using the formatted date */}
                <Text style={styles.profileDetail}>Signed Up: {formattedSignupDate}</Text>
                
                {/* REMOVED: The View containing the User ID display has been removed */}
            </View>
            
            <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: '#CC5500' }]} // Strong color for a logout/danger action
                onPress={logout}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Log Out</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};
// --- Tab Menu Component (The Fixed Navigation Bar) ---
const TabMenu = ({ currentPage, navigate }) => (
    <View style={styles.tabContainer}>
        {Object.entries(TABS).map(([key, { icon, activeIcon, label }]) => {
            const isFocused = currentPage === key;
            const color = isFocused ? THEME_COLORS.PrimaryBrown : THEME_COLORS.SecondaryText;

            return (
                <TouchableOpacity
                    key={key}
                    style={styles.tabItem}
                    onPress={() => navigate(key)}
                >
                    {/* Switch between outline and solid icon based on focus */}
                    <Ionicons name={isFocused ? activeIcon : icon} size={24} color={color} />
                    <Text style={[styles.tabLabel, { color }]}>{label}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

// --- Main App Component (DashboardScreen) ---
const DashboardScreen = () => {
    const [currentPage, setCurrentPage] = useState('Home');
    const { currentUser } = useAuth();

    const navigate = (page) => {
        setCurrentPage(page);
    };

    const renderContent = () => {
        if (!currentUser) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLORS.PrimaryBrown} />
                    <Text style={styles.loadingText}>Loading dashboard...</Text>
                </View>
            );
        }
        
        switch (currentPage) {
            case 'Home':
                return <HomeScreen navigate={navigate} currentUser={currentUser} />;
            case 'Reviewer':
                return <ReviewerGenerator />;
            case 'Quiz':
                return <QuizGenerator />;
            case 'Profile':
                return <ProfileScreen />;
            default:
                return <HomeScreen navigate={navigate} currentUser={currentUser} />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* The main content now starts immediately after the safe area, without a fixed header */}
            <View style={styles.mainContent}> 
                {renderContent()}
            </View>

            {/* Navigation Menu (Fixed to the bottom) */}
            <TabMenu currentPage={currentPage} navigate={navigate} />
        </SafeAreaView>
    );
};

export default DashboardScreen;