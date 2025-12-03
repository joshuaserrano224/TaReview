import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
// Adjust path to your Auth hook
import { useAuth } from '../../Services/useAuth';
// IMPORTANT: Adjust import path for your styles/theme if needed.

// --- THEME COLORS (Replicating the established aesthetic) ---
const THEME_COLORS = {
    PrimaryBrown: '#8B4513',        // Darker Brown (Icons, Text)
    AccentBrown: '#C58940',         // Medium Brown/Tan (Subtler Accent)
    SecondaryBrown: '#D2B48C',      // Lighter Brown/Tan 
    PrimaryBackground: '#F7F4EF',   // Light Beige/Cream (Main Screen Background)
    CardBackground: '#FFFFFF',      // White for card lifts
    PrimaryText: '#333333',         // Dark Gray 
    SecondaryText: '#777777',       // Medium Gray 
    ErrorRed: '#D84315',            // For Log Out button
};


// --- PROFILE ITEM COMPONENT ---
// Reusable component for the two new action buttons
const ProfileActionButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={profileStyles.actionButton} onPress={onPress}>
        <Ionicons name={icon} size={28} color={THEME_COLORS.PrimaryBrown} />
        <Text style={profileStyles.actionButtonText}>{title}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={THEME_COLORS.SecondaryText} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
);

// =========================================================
// --- SCREEN COMPONENT ---
// =========================================================
const ProfileScreen = () => {
    const router = useRouter(); 
    const { currentUser, logout, isLoading } = useAuth();
    
    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        
        try {
            const date = new Date(dateString.split('T')[0]);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = date.getFullYear();

            if (year > 1900) {
                return `${month}/${day}/${year}`;
            }
            
        } catch (e) {
            console.error("Date parsing failed:", e);
        }
        return 'N/A';
    };

    const authAccountValue = currentUser?.authAccount || 'N/A';
    const fullName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Logged In User';
    const formattedSignupDate = formatDate(currentUser?.signupDate);

    // LOGOUT HANDLER WITH CONFIRMATION
    const handleLogout = () => {
        Alert.alert(
            "Confirm Log Out",
            "Are you sure you want to log out of your account?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    onPress: () => logout(), 
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };

    return (
        <ScrollView 
            style={profileStyles.mainContent} 
            contentContainerStyle={profileStyles.contentPadding}
        >
            
            {/* 🎯 HEADER - Removed the settings icon */}
            <View style={profileStyles.headerContainer}>
                <Text style={profileStyles.headerTitle}>My Profile</Text>
                {/* REMOVED: <Ionicons name="settings-outline" size={24} color={THEME_COLORS.PrimaryBrown} /> */}
            </View>

            {/* 🎯 USER INFO CARD */}
            <View style={profileStyles.userInfoCard}>
                <Ionicons 
                    name="person-circle-outline" 
                    size={100} 
                    color={THEME_COLORS.AccentBrown} 
                    style={profileStyles.profileIcon}
                />
                
                <Text style={profileStyles.profileName}>{fullName}</Text>
                <Text style={profileStyles.profileDetail}>{authAccountValue}</Text>
                <Text style={profileStyles.signupDateText}>Member Since: {formattedSignupDate}</Text>
            </View>

            {/* --- ACTION LINKS SECTION --- */}
            <Text style={profileStyles.sectionLabel}>Activity & Reviewers</Text>
            <View style={profileStyles.actionsGroup}>
                
                {/* QUIZ HISTORY BUTTON */}
                <ProfileActionButton
                    icon="receipt-outline"
                    title="Quiz History"
                    onPress={() => router.push('/Dashboard/QuizHistory')}
                />
                
                {/* SAVED REVIEWERS BUTTON */}
                <ProfileActionButton
                    icon="folder-open-outline"
                    title="Saved Reviewers"
                    onPress={() => router.push('/Dashboard/SavedReviewersScreen')}
                />
            </View>

            {/* --- LOGOUT BUTTON --- */}
            <TouchableOpacity 
                style={profileStyles.logoutButton}
                onPress={handleLogout} 
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={profileStyles.logoutButtonText}>
                        <Ionicons name="log-out-outline" size={18} color="#fff" /> Log Out
                    </Text>
                )}
            </TouchableOpacity>
            
        </ScrollView>
    );
};

// =========================================================
// --- STYLESHEET (Updated headerContainer alignment) ---
// =========================================================

const profileStyles = StyleSheet.create({
    mainContent: {
        flex: 1,
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    contentPadding: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        // 🎯 ALIGNED: Changed justification to 'flex-start' or removed it to ensure title sits cleanly on the left
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingVertical: 20,
        paddingTop: 65, 
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText,
    },
    userInfoCard: {
        alignItems: 'center',
        backgroundColor: THEME_COLORS.CardBackground,
        padding: 25,
        borderRadius: 15,
        marginBottom: 25,
        shadowColor: THEME_COLORS.PrimaryBrown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    profileIcon: {
        marginBottom: 10,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
        marginBottom: 5,
    },
    profileDetail: {
        fontSize: 16,
        color: THEME_COLORS.SecondaryText,
    },
    signupDateText: {
        fontSize: 12,
        color: THEME_COLORS.SecondaryText,
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: THEME_COLORS.SecondaryBrown,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: THEME_COLORS.PrimaryText,
        marginBottom: 10,
        marginTop: 5,
    },
    actionsGroup: {
        backgroundColor: THEME_COLORS.CardBackground,
        borderRadius: 15,
        marginBottom: 30,
        shadowColor: THEME_COLORS.PrimaryText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: THEME_COLORS.PrimaryText,
        marginLeft: 15,
    },
    logoutButton: {
        backgroundColor: THEME_COLORS.ErrorRed, 
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;