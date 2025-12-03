import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

// --- IMPORTS ---
import { useAuth } from '../../Services/useAuth';
// Import existing styles
import styles, { THEME_COLORS } from './DashboardStyles';

// 🚀 SCREEN IMPORTS:
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import QuizGenerator from './QuizGenerator';
import QuizHistory from './QuizHistory';
import ReviewerGenerator from './ReviewGenerator';
import SavedReviewersScreen from './SavedReviewersScreen';

// --- ICON & NAVIGATION CONFIGURATION ---
const TABS = {
    Home: { icon: 'home-outline', activeIcon: 'home', label: 'Dashboard' },
    Reviewer: { icon: 'book-outline', activeIcon: 'book', label: 'Reviewer' },
    Quiz: { icon: 'help-circle-outline', activeIcon: 'help-circle', label: 'Quiz' },
    Profile: { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
};

// ------------------------------------
// --- Tab Menu Component (The Fixed Navigation Bar) ---
// ------------------------------------
const TabMenu = ({ currentPage, navigate }) => {
    // ⚠️ HIDE the menu if we are on a non-tab screen (like SavedReviewersScreen)
    if (!TABS.hasOwnProperty(currentPage)) {
        return null; 
    }

    return (
        <View style={styles.tabContainer}>
            {Object.entries(TABS).map(([key, { icon, activeIcon, label }]) => {
                const isFocused = currentPage === key;
                const color = isFocused ? THEME_COLORS.PrimaryBrown : THEME_COLORS.SecondaryText;

                return (
                    <TouchableOpacity
                        key={key}
                        style={styles.tabItem}
                        // Calls the interception function in DashboardScreen
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
};

// ------------------------------------
// --- Main App Component (DashboardScreen) ---
// ------------------------------------
const DashboardScreen = () => {
    const [currentPage, setCurrentPage] = useState('Home'); 
    const { currentUser } = useAuth();
    
    // ⭐ Quiz State
    const [isQuizInProgress, setIsQuizInProgress] = useState(false);
    // ⭐ NEW STATE: Tracks if ReviewerGenerator has unsaved content
    const [isReviewerInProgress, setIsReviewerInProgress] = useState(false);


    // ⭐ Quiz Status Callback
    const handleQuizStatusChange = (isActive) => {
        setIsQuizInProgress(isActive);
    };

    // ⭐ NEW FUNCTION: Callback passed to ReviewerGenerator to update the state
    const handleReviewerStatusChange = (isActive) => {
        setIsReviewerInProgress(isActive);
    };

    // 🚀 UPDATED NAVIGATION FUNCTION: Intercepts tab clicks if a quiz OR reviewer is active
    const navigate = (page) => {
        let shouldBlockNavigation = false;
        let alertTitle = "";
        let alertMessage = "";

        // Check 1: If leaving Quiz with unsaved progress
        if (currentPage === 'Quiz' && isQuizInProgress && page !== 'Quiz') {
            shouldBlockNavigation = true;
            alertTitle = "Unfinished Quiz";
            alertMessage = "You have an active quiz! Are you sure you want to leave? Your progress will be lost.";
        }
        
        // Check 2: If leaving Reviewer with unsaved progress (NEW LOGIC)
        if (currentPage === 'Reviewer' && isReviewerInProgress && page !== 'Reviewer') {
             shouldBlockNavigation = true;
             alertTitle = "Unsaved Reviewer Content";
             alertMessage = "You have unsaved content in the Reviewer Generator. Are you sure you want to leave? Your input will be lost.";
        }

        if (shouldBlockNavigation) {
            // Intercept navigation and show confirmation alert
            Alert.alert(
                alertTitle,
                alertMessage,
                [
                    { 
                        text: "Cancel", 
                        style: "cancel" 
                    },
                    {
                        text: "Leave Anyway",
                        style: "destructive",
                        onPress: () => {
                            // Reset the relevant status flag before navigating
                            if (currentPage === 'Quiz') {
                                setIsQuizInProgress(false); 
                            }
                            if (currentPage === 'Reviewer') {
                                setIsReviewerInProgress(false);
                            }
                            setCurrentPage(page);
                        },
                    },
                ]
            );
            return; // STOP navigation
        }
        
        // Proceed normally if no unsaved work or navigating to the same page
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
                // ⭐ PASS THE NEW STATUS CALLBACK TO REVIEWER GENERATOR
                return <ReviewerGenerator onReviewerStatusChange={handleReviewerStatusChange} />;
            case 'Quiz':
                // ⭐ PASS THE STATUS CALLBACK TO QUIZ GENERATOR
                return <QuizGenerator onQuizStatusChange={handleQuizStatusChange} />;
            case 'Profile':
                return <ProfileScreen />;
            case 'SavedReviewersScreen':
                return <SavedReviewersScreen navigate={navigate} />; 
            case 'QuizHistory':
                return <QuizHistory navigate={navigate} />; 
            default:
                return <HomeScreen navigate={navigate} currentUser={currentUser} />;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.mainContent}> 
                {renderContent()}
            </View>

            {/* Navigation Menu (Fixed to the bottom) */}
            <TabMenu currentPage={currentPage} navigate={navigate} /> 
        </SafeAreaView>
    );
};

export default DashboardScreen;