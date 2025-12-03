import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --- DATABASE IMPORTS ---
import { getQuizResults, initDatabase } from '../../Services/Database';


// NOTE: Defined THEME_COLORS based on the screenshot and uniform style
const THEME_COLORS = {
    // Primary Branding Colors
    PrimaryBrown: '#8B4513',        // Darker Brown (Icons, Main Text Accent)
    SecondaryBrown: '#D2B48C',      // Lighter Brown/Tan (Soft Accents)
    
    // Background and Card Colors
    PrimaryBackground: '#F7F4EF',   // Light Beige/Cream (Main Screen Background - Matches image)
    CardBackground: '#FFFFFF',      // White for list item cards
    
    // Text and Status Colors
    PrimaryText: '#333333',         // Dark Gray (Main text)
    SecondaryText: '#777777',       // Medium Gray (Subtitle text)
    SuccessGreen: '#4CAF50',        // Green (High score)
    DangerRed: '#D84315',           // Red (Low score, Error messages)
    WarningOrange: '#FF9800',       // Orange (Middle tier score)
};

// =========================================================
// HISTORY ITEM RENDERER (UNMODIFIED)
// =========================================================

const HistoryItem = ({ item }) => {
    // Score color logic
    const scoreColor = item.percentage >= 70 ? THEME_COLORS.SuccessGreen : 
                        item.percentage >= 50 ? THEME_COLORS.WarningOrange : 
                        THEME_COLORS.DangerRed;

    // Use shorter date format for better fit
    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = new Date(item.date).toLocaleString('en-US', dateOptions);

    return (
        <View style={historyStyles.itemContainer}>
            {/* Left Side: Icon, Title, Date */}
            <View style={historyStyles.itemLeft}>
                <Ionicons 
                    name="receipt-outline" 
                    size={24} 
                    color={THEME_COLORS.PrimaryBrown} 
                    style={{ marginRight: 15 }} 
                />
                <View style={{ flex: 1 }}>
                    <Text style={historyStyles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={historyStyles.itemSubtitle}>{formattedDate}</Text>
                </View>
            </View>

            {/* Right Side: Score Box */}
            <View style={historyStyles.scoreBox}>
                <Text style={[historyStyles.scoreText, { color: scoreColor }]}>
                    {item.percentage}%
                </Text>
                <Text style={historyStyles.totalScoreText}>
                    ({item.score})
                </Text>
            </View>
        </View>
    );
};

// =========================================================
// MAIN COMPONENT: QuizHistory (UPDATED fetchHistory)
// =========================================================

const QuizHistory = () => { 
    const router = useRouter(); // Initialize the router hook

    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchHistory = useCallback(async () => {
        setIsRefreshing(true);
        setError('');
        
        try {
            await initDatabase(); 
            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;
            
            if (!user || !user.id) {
                setError("Authentication Error: Please log in to view your history.");
                setHistory([]);
                return;
            }
            
            const results = await getQuizResults(user.id);
            
            // ⭐ FIX: Ensure Descending Order (Latest First) using explicit date comparison.
            const sortedHistory = [...results].sort((a, b) => {
                // Convert dates to timestamps for reliable comparison
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                
                // DESCENDING sort: b - a puts the greater (later) date first.
                return dateB - dateA; 
            });

            setHistory(sortedHistory);
        } catch (e) {
            console.error("Failed to fetch quiz history:", e);
            setError(`Failed to load history: ${e.message}`);
            setHistory([]);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory]) 
    );

    // --- RENDER LOGIC (UNMODIFIED) ---

    if (isLoading) {
        return (
            <View style={historyStyles.mainContent}>
                <ActivityIndicator size="large" color={THEME_COLORS.PrimaryBrown} style={{ marginTop: 20 }} />
                <Text style={historyStyles.loadingText}>Loading Quiz History...</Text>
            </View>
        );
    }
    
    return (
        <View style={historyStyles.mainContent}>
            
            {/* 🌟 Header Layout */}
            <View style={historyStyles.headerContainer}>
                <TouchableOpacity
                    // 🎯 FIX: Using router.replace() to force navigation to the Dashboard path
                    // This bypasses potential issues with the navigation stack history.
                    onPress={() => router.replace('/Dashboard/Dashboard')} 
                    style={historyStyles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={THEME_COLORS.PrimaryBrown}
                    />
                </TouchableOpacity>

                <Text style={historyStyles.headerTitle}>
                    Quiz History
                </Text>
                <Ionicons name="stats-chart-outline" size={24} color={THEME_COLORS.PrimaryBrown} style={{ marginLeft: 'auto' }} />

            </View>

            {/* 3. Error / Empty / List View */}
            {error ? (
                <View style={historyStyles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={30} color={THEME_COLORS.DangerRed} />
                    <Text style={historyStyles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchHistory} style={historyStyles.retryButton}>
                        <Text style={historyStyles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            ) : history.length === 0 ? (
                /* 4. Empty State View */
                <View style={historyStyles.centered}>
                    <Ionicons name="bulb-outline" size={50} color={THEME_COLORS.SecondaryText} />
                    <Text style={historyStyles.emptyText}>
                        You haven't completed any quizzes yet.
                    </Text>
                    <Text style={historyStyles.emptySubtitle}>
                        Generate a quiz and submit your answers to see your scores here!
                    </Text>
                    <TouchableOpacity onPress={fetchHistory} style={historyStyles.retryButton}>
                        <Text style={historyStyles.retryButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                /* 5. Main List View */
                <View style={historyStyles.listWrapper}>
                    <FlatList
                        data={history}
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        renderItem={({ item }) => <HistoryItem item={item} />}
                        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 0 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={fetchHistory}
                                colors={[THEME_COLORS.PrimaryBrown]}
                                tintColor={THEME_COLORS.PrimaryBrown}
                            />
                        }
                    />
                </View>
            )}
        </View>
    );
};

// =========================================================
// STYLESHEET (UNMODIFIED)
// =========================================================

const historyStyles = StyleSheet.create({
    mainContent: {
        flex: 1,
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10,
        paddingHorizontal: 20,
        paddingBottom: 15, 
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    backButton: {
        padding: 5, 
        borderRadius: 20, 
        backgroundColor: 'transparent', 
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText,
        marginLeft: 15,
        flexGrow: 1, 
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME_COLORS.PrimaryBackground,
        padding: 20,
    },
    listWrapper: {
        flex: 1,
        paddingHorizontal: 20, // Padding for the overall list container
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15, 
        marginTop: 10, // Space between cards
        borderRadius: 10, // Rounded corners for the card
        
        // CARD EFFECT: White background and subtle shadow to match the screenshot
        backgroundColor: THEME_COLORS.CardBackground, 
        
        // iOS Shadow
        shadowColor: THEME_COLORS.PrimaryText,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        
        // Android Shadow (Elevation)
        elevation: 3, 
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 10,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: THEME_COLORS.PrimaryText,
    },
    itemSubtitle: {
        fontSize: 11,
        color: THEME_COLORS.SecondaryText,
        marginTop: 4,
    },
    scoreBox: {
        minWidth: 70,
        alignItems: 'flex-end',
        paddingLeft: 5,
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalScoreText: {
        fontSize: 12,
        color: THEME_COLORS.SecondaryText,
        marginTop: 2,
    },
    separator: {
        height: 0, 
    },
    emptyText: {
        fontSize: 18,
        color: THEME_COLORS.SecondaryText,
        marginTop: 15,
        fontWeight: 'bold',
    },
    emptySubtitle: {
        fontSize: 14,
        color: THEME_COLORS.SecondaryText,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 10,
        color: THEME_COLORS.PrimaryBrown,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFE5E0',
    },
    errorText: {
        color: THEME_COLORS.DangerRed,
        marginTop: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: THEME_COLORS.PrimaryBrown,
    },
    retryButtonText: {
        color: THEME_COLORS.CardBackground, 
        fontWeight: 'bold',
    }
});

export default QuizHistory;