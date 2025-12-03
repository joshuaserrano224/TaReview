import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router'; // Changed useNavigation to useRouter
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform, // Added Platform for status bar padding
    StyleSheet, // Added StyleSheet
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants'; // Added Constants for status bar height
import { deleteReviewerById, fetchAllReviewers } from "../../Services/Database";
// import styles, { THEME_COLORS } from './DashboardStyles'; // <-- We will define styles locally for completeness

// --- THEME COLORS (Copied from QuizHistory for consistency) ---
const THEME_COLORS = {
    // Primary Branding Colors
    PrimaryBrown: '#8B4513',        // Darker Brown (Icons, Main Text Accent)
    SecondaryBrown: '#D2B48C',      // Lighter Brown/Tan (Soft Accents)
    
    // Background and Card Colors
    PrimaryBackground: '#F7F4EF',   // Light Beige/Cream (Main Screen Background)
    CardBackground: '#FFFFFF',      // White for list item cards
    
    // Text and Status Colors
    PrimaryText: '#333333',         // Dark Gray (Main text)
    SecondaryText: '#777777',       // Medium Gray (Subtitle text)
    SuccessGreen: '#4CAF50',        // Green 
    DangerRed: '#D84315',           // Red 
    WarningOrange: '#FF9800',       // Orange 
    ErrorRed: '#D84315',            // Use DangerRed for errors
    LightGray: '#CCCCCC',           // For empty state icon
};


// =========================================================
// --- SCREEN COMPONENT ---
// =========================================================
const SavedReviewersScreen = () => {
    const router = useRouter(); // Use useRouter for navigation
    const [reviewers, setReviewer] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // FIXED: wrap loadReviewers in useCallback so it becomes stable
    const loadReviewers = useCallback(async () => {
        try {
            setLoading(true);

            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;

            if (!user || !user.id) {
                setError("User not found.");
                return;
            }

            const data = await fetchAllReviewers(user.id);

            setReviewer(data);
            setError(null);

        } catch (err) {
            console.error("LoadReviewer Error:", err);
            setError("Failed to load reviewer.");
        } finally {
            setLoading(false);
        }
    }, []); 

    // FIXED: remove loadReviewers from dependency array
    useFocusEffect(
        useCallback(() => {
            loadReviewers();
        }, []) // run only when screen focuses
    );

    // 🗑️ Delete reviewer
    const handleDeleteReviewer = useCallback(async (id, title) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete the reviewer: "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteReviewerById(id);
                            loadReviewers();
                            Alert.alert("Deleted", `"${title}" has been removed.`);
                        } catch (e) {
                            console.error("Deletion failed:", e);
                            Alert.alert("Error", "Failed to delete the reviewer.");
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    }, [loadReviewers]);

    // --- RENDER ITEM FOR FLATLIST ---
    const renderItem = ({ item }) => {
        const date = new Date(item.date_saved); 
        const formattedDate = date.toLocaleDateString() + ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            // 🎯 Applied QuizHistory Card Styles
            <View style={reviewerStyles.reviewerCard}> 
                <TouchableOpacity 
                    style={reviewerStyles.reviewerTextContainer}
                    onPress={() =>
                        // Using router.push for navigation within the stack
                        router.push({
                            pathname: 'Dashboard/ViewReviewer',
                            params: {
                                reviewerId: item.id,
                                title: item.title
                            }
                        })
                    }
                >
                    <View>
                        <Text style={reviewerStyles.reviewerTitleText}>{item.title}</Text>
                        <Text style={reviewerStyles.reviewerDateText}>Saved: {formattedDate}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={reviewerStyles.deleteButtonContainer}
                    onPress={() => handleDeleteReviewer(item.id, item.title)}
                >
                    <Ionicons 
                        name="trash-bin-outline"
                        size={24}
                        color={THEME_COLORS.ErrorRed}
                    />
                </TouchableOpacity>

                <Ionicons 
                    name="chevron-forward-outline"
                    size={24}
                    color={THEME_COLORS.PrimaryBrown}
                    style={{ marginLeft: 5 }}
                />
            </View>
        );
    };

    // --- MAIN RENDER ---
    return (
        <View style={reviewerStyles.mainContent}>
            
            {/* 🎯 HEADER STYLED LIKE QuizHistory */}
            <View style={reviewerStyles.headerContainer}>
                <TouchableOpacity
                    // Back Button functionality: Navigate to Dashboard
                    onPress={() => router.replace('/Dashboard/Dashboard')}
                    style={reviewerStyles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={THEME_COLORS.PrimaryBrown}
                    />
                </TouchableOpacity>
                <Text style={reviewerStyles.headerTitle}>
                    Saved Study Guides
                </Text>
                {/* Right side icon matching QuizHistory's layout space */}
                <Ionicons name="folder-open-outline" size={24} color={THEME_COLORS.PrimaryBrown} style={{ marginLeft: 'auto' }} /> 
            </View>

            {/* --- Conditional Content --- */}
            {isLoading ? (
                <ActivityIndicator size="large" color={THEME_COLORS.PrimaryBrown} style={{ marginTop: 20 }} />
            ) : error ? (
                <View style={[reviewerStyles.errorContainer, { marginHorizontal: 20 }]}>
                    <Ionicons name="alert-circle-outline" size={20} color={THEME_COLORS.DangerRed} />
                    <Text style={reviewerStyles.errorText}>{error}</Text>
                </View>
            ) : reviewers.length === 0 ? (
                <View style={reviewerStyles.emptyContainer}>
                    <Ionicons name="folder-open-outline" size={50} color={THEME_COLORS.SecondaryText} />
                    <Text style={reviewerStyles.emptyText}>You haven't saved any reviewers yet.</Text>
                    <Text style={[reviewerStyles.emptyText, { fontSize: 14 }]}>
                        Generate and save a reviewer first from the previous screen.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={reviewers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
                />
            )}
        </View>
    );
};

// =========================================================
// --- STYLESHEET (Aligned with QuizHistory) ---
// =========================================================

const reviewerStyles = StyleSheet.create({
    mainContent: {
        flex: 1,
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    // 🎯 HEADER STYLES
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        // Padding adjusted for status bar and uniform spacing
        paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10,
        paddingHorizontal: 20,
        paddingBottom: 15, 
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    backButton: {
        padding: 5, 
        borderRadius: 20, 
        backgroundColor: 'transparent', // Match QuizHistory style
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText,
        marginLeft: 15,
        flexGrow: 1, 
    },
    // 🎯 CARD STYLES
    reviewerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15, 
        marginTop: 10, 
        borderRadius: 10, 
        backgroundColor: THEME_COLORS.CardBackground, 
        
        // Shadow effect matching QuizHistory
        shadowColor: THEME_COLORS.PrimaryText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3, 
    },
    reviewerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    reviewerTitleText: {
        fontSize: 15,
        fontWeight: '600',
        color: THEME_COLORS.PrimaryText,
    },
    reviewerDateText: {
        fontSize: 11,
        color: THEME_COLORS.SecondaryText,
        marginTop: 4,
    },
    deleteButtonContainer: {
        padding: 5,
    },
    // --- Other Content Styles ---
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    emptyText: {
        fontSize: 18,
        color: THEME_COLORS.SecondaryText,
        marginTop: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E0',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    errorText: {
        color: THEME_COLORS.DangerRed,
        marginLeft: 10,
        fontWeight: '600',
    },
});

export default SavedReviewersScreen;