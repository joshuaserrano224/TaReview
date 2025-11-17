import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

// --- White and Beige/Brown Aesthetic Palette ---
const THEME_COLORS = { 
    Background: '#F7F4EF',          // Lightest Beige for main screen background
    CardBackground: '#FFFFFF',      // Pure White for elevated cards
    PrimaryText: '#3D3630',         // Dark Brown for main text
    SecondaryText: '#A0A9AE',       // Muted Gray/Beige for subtitles and inactive elements
    PrimaryBrown: '#A67C52',        // Muted Brown/Beige for primary buttons and active tabs (Warm tone)
    AccentBrown: '#8B4513',         // Deeper Brown for important actions/icons
    AccentHighlight: '#EFEAE2',     // Very light beige/separator color
};

const styles = StyleSheet.create({
    // --- Layout Containers ---
    safeArea: {
        flex: 1,
        backgroundColor: THEME_COLORS.Background,
    },
    mainContent: {
        flex: 1,
    },
    // CRITICAL SPACING: Ensure main scrollable content clears the space taken by the fixed bottom tab bar (Tab height + safe area).
    contentPadding: {
        paddingHorizontal: 20, 
        // FIX APPLIED HERE: Increased paddingTop to push the header down from the status bar.
        paddingTop: 50, 
        paddingBottom: 120, // Provides ample clearance for the tab bar and device gestures
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Header ---
    header: {
        backgroundColor: THEME_COLORS.CardBackground,
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME_COLORS.AccentHighlight,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
    },

    // --- Typography ---
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
        marginTop: 35, // Balanced spacing above section
        marginBottom: 15, // Uniform spacing below section
    },
    subtitle: {
        fontSize: 14,
        color: THEME_COLORS.SecondaryText,
        marginBottom: 30, // Clean spacing after introduction text
        lineHeight: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
    },

    // --- Feature Cards (Perfectly Uniform 2-column layout) ---
    featureContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        // No marginBottom needed here
    },
    card: {
        width: (width - 60) / 2, // Perfect fit: 20px L/R padding, 20px middle gap
        height: 140, // Consistent fixed height
        backgroundColor: THEME_COLORS.CardBackground,
        padding: 20, // Increased internal padding for breathing room
        borderRadius: 15,
        marginBottom: 15, // Tighter spacing between card rows
        alignItems: 'flex-start',
        justifyContent: 'space-between', 
        shadowColor: THEME_COLORS.PrimaryBrown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: THEME_COLORS.AccentHighlight,
        borderLeftWidth: 5, 
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME_COLORS.PrimaryText,
        marginBottom: 4, 
    },
    cardSubtitle: {
        fontSize: 12,
        color: THEME_COLORS.PrimaryBrown,
        fontWeight: '500',
    },

    // --- Quick Access / List Items (Perfectly Uniform List) ---
    quickAccessItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME_COLORS.CardBackground,
        paddingHorizontal: 20, // Keeps horizontal padding consistent
        paddingVertical: 18, // Optimal height for list item
        borderRadius: 12,
        marginBottom: 10, // Tighter vertical space for list items
        borderLeftWidth: 4,
        borderLeftColor: THEME_COLORS.PrimaryBrown,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    quickAccessText: {
        marginLeft: 15,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
        fontWeight: '500',
    },

    // --- Profile Screen ---
    profileBox: {
        backgroundColor: THEME_COLORS.CardBackground,
        padding: 30, 
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
        marginTop: 10,
    },
    profileDetail: {
        fontSize: 14,
        color: THEME_COLORS.SecondaryText,
        marginTop: 5,
    },

    // --- Buttons ---
    primaryButton: {
        padding: 18, 
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: THEME_COLORS.AccentBrown,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },

    // --- Forms (Reviewer/Quiz) ---
    formArea: {
        padding: 25, 
        backgroundColor: THEME_COLORS.CardBackground,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 280, 
        justifyContent: 'center',
    },
    formText: {
        color: THEME_COLORS.SecondaryText,
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
    },
    
    // --- Navigation Bar (Bottom Tab Menu - FINAL FIX) ---
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: THEME_COLORS.CardBackground,
        borderTopWidth: 1,
        borderTopColor: THEME_COLORS.AccentHighlight,
        paddingTop: 10, // Top padding controls icon position
        paddingBottom: 35, // Increased padding to clear the home indicator/buttons universally
        position: 'absolute', 
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 10, 
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start', // Use flex-start to allow padding to dictate overall size
        // No paddingVertical here, padding is handled by the tabContainer for uniformity
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    },
});

export default styles; 
export { THEME_COLORS };

