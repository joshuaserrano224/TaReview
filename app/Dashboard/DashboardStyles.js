import { Dimensions, StyleSheet } from 'react-native'; // 🌟 ADDED: Platform for potential OS-specific padding if needed

const { width } = Dimensions.get('window');

// --- White and Beige/Brown Aesthetic Palette ---
const THEME_COLORS = { 
    Background: '#F7F4EF',          // Lightest Beige for main screen background
    CardBackground: '#FFFFFF',      // Pure White for elevated cards
    PrimaryText: '#2b2723ff',         // Dark Brown for main text
    SecondaryText: '#A0A9AE',       // Muted Gray/Beige for subtitles and inactive elements
    PrimaryBrown: '#A67C52',        // Muted Brown/Beige for primary buttons and active tabs (Warm tone)
    AccentBrown: '#8B4513',         // Deeper Brown for important actions/icons (Used for primary buttons)
    AccentHighlight: '#EFEAE2',     // Very light beige/separator color
    DangerRed: '#D32F2F',          // Standardized Red
    LightGray: '#DDD',             // Used in quiz/form
    BorderGray: '#E0E0E0',          // Used in forms/separators
    // New color constant for background replacement
    AppBackground: '#F7F4EF', // Alias for Background
};

const TOP_HEADER_PADDING = 65; // 🌟 STANDARDIZED TOP PADDING VALUE

const styles = StyleSheet.create({
    // --- Layout Containers ---
    safeArea: {
        flex: 1,
        backgroundColor: THEME_COLORS.Background,
    },
    mainContent: {
        flex: 1,
    },
    // 1. APPLIED PADDING: For scrollable content
    contentPadding: {
        paddingHorizontal: 20, 
        paddingTop: TOP_HEADER_PADDING, // 🌟 PADDING APPLIED HERE
        paddingBottom: 120, // Provides ample clearance for the tab bar and device gestures
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // --- Header ---
    // 2. APPLIED PADDING: For fixed headers at the top of a screen
    header: {
        backgroundColor: THEME_COLORS.CardBackground,
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingTop: TOP_HEADER_PADDING, // 🌟 PADDING APPLIED HERE
        borderBottomWidth: 1,
        borderBottomColor: THEME_COLORS.AccentHighlight,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    headerTitle: { // Updated to be consistent with other usage
        fontSize: 22,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
    },

    // --- Typography ---
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
        marginTop: 35,
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 14,
        color: THEME_COLORS.SecondaryText,
        marginBottom: 30,
        lineHeight: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
    },

    // --- Feature Cards ---
    featureContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 60) / 2,
        height: 140,
        backgroundColor: THEME_COLORS.CardBackground,
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
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

    // --- Quick Access / List Items ---
    quickAccessItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME_COLORS.CardBackground,
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 10,
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
        color: THEME_COLORS.CardBackground, // Use CardBackground (White) for text contrast
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME_COLORS.CardBackground, 
        borderWidth: 1,
        borderColor: THEME_COLORS.PrimaryBrown,
        paddingVertical: 12,
        borderRadius: 8,
    },
    secondaryButtonText: {
        color: THEME_COLORS.PrimaryBrown,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    linkButton: { // Consolidated for the clearer definition
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center', 
        padding: 10,
        marginTop: 5,
    },
    linkButtonText: {
        fontSize: 16,
        color: THEME_COLORS.DangerRed,
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
    inputArea: { // Consolidated & refined to the clearer definition
        minHeight: 140,
        borderWidth: 1,
        borderColor: THEME_COLORS.SecondaryText + '33',
        borderRadius: 10, 
        padding: 12, 
        textAlignVertical: 'top', 
        backgroundColor: THEME_COLORS.CardBackground,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
        marginBottom: 20, 
        fontWeight: '400', 
    },
    
    // --- Navigation Bar (Bottom Tab Menu) ---
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: THEME_COLORS.CardBackground,
        borderTopWidth: 1,
        borderTopColor: THEME_COLORS.AccentHighlight,
        paddingTop: 10,
        paddingBottom: 35,
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
        justifyContent: 'flex-start',
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '600',
    },

    // --- Generator Screen Styles (Consolidated & refined) ---
    screenContainer: {
        paddingTop: 25, // Tighter: TOP_HEADER_PADDING is not needed if header is not fixed
        paddingHorizontal: 15,
        backgroundColor: THEME_COLORS.Background,
    },
    sectionTitle: { // Tighter spacing
        fontSize: 17, 
        fontWeight: '700', 
        color: THEME_COLORS.PrimaryText, 
        marginTop: 15,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '500', 
        color: THEME_COLORS.AccentBrown, 
        marginRight: 8,
    },
    numberInput: {
        height: 36, // Compact
        width: 60,
        padding: 8, 
        textAlign: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: THEME_COLORS.SecondaryText,
        backgroundColor: THEME_COLORS.Background,
        color: THEME_COLORS.PrimaryText,
        fontWeight: '600', 
        fontSize: 16, 
    },

    // --- Error & Status (Consolidated & refined) ---
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorText: {
        color: '#900', // Still using a hardcoded dark red for visual impact
        marginLeft: 8,
        flexShrink: 1,
        fontSize: 14,
    },
    fileStatusContainer: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: THEME_COLORS.AccentHighlight, 
        borderRadius: 8,
        marginBottom: 10,
    },
    fileStatusText: {
        fontSize: 14, // Retaining the 14px size for readability
        color: THEME_COLORS.SecondaryText, 
        fontWeight: '500', 
        flexShrink: 1, 
    },
    clearButtonText: {
        fontSize: 13,
        color: THEME_COLORS.DangerRed,
        fontWeight: '600',
        marginLeft: 3,
    },
    
    // --- Results & Output (Consolidated & refined) ---
    resultsBox: { // Consolidated & refined
        marginTop: 20,
        padding: 15,
        backgroundColor: THEME_COLORS.CardBackground, // White background for the output area
        borderRadius: 10,
        borderColor: THEME_COLORS.BorderGray,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    resultsHeader: { // Consolidated & refined
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryBrown,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: THEME_COLORS.LightGray,
        paddingBottom: 8,
    },
    // Aesthetic Headers (H1 and H2 equivalents)
    outputHeader: { // Used for titles like "# Key Concepts"
        fontSize: 18,
        fontWeight: '900',
        color: THEME_COLORS.AccentBrown, // Using AccentBrown for higher contrast
        marginTop: 20,
        marginBottom: 8,
    },
    outputSubHeader: { // Used for sub-sections like "## Main Points"
        fontSize: 16,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText, // Darker color
        marginTop: 15,
        marginBottom: 5,
        paddingLeft: 10,
        borderLeftWidth: 4, // Visual divider
        borderLeftColor: THEME_COLORS.PrimaryBrown, 
    },
    outputText: { // Default paragraph text
        fontSize: 14,
        lineHeight: 22,
        color: THEME_COLORS.PrimaryText, // Using PrimaryText
        marginBottom: 10,
    },
    // Inline Formatting
    boldText: {
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText, // Darker color for high contrast
    },
    italicText: {
        fontStyle: 'italic',
        color: THEME_COLORS.PrimaryText,
    },
    // List Item Styling
    listItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        paddingLeft: 5,
    },
    bulletIcon: {
        marginTop: 7, 
        marginRight: 8,
    },
    outputListItem: {
        flex: 1, 
        fontSize: 14,
        lineHeight: 20,
        color: THEME_COLORS.PrimaryText,
    },
    outputSpacer: {
        height: 5, 
    },

    // --- Generator Grid/Button Styles (Compact) ---
    gridContainer: {
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    gridButton: {
        flexBasis: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10, 
        paddingHorizontal: 8,
        marginBottom: 8,
        borderRadius: 8, 
        backgroundColor: THEME_COLORS.CardBackground,
        borderWidth: 1,
        borderColor: THEME_COLORS.AccentHighlight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08, 
        shadowRadius: 2,
        elevation: 2, 
    },
    gridButtonActive: {
        backgroundColor: THEME_COLORS.PrimaryBrown,
        borderColor: THEME_COLORS.PrimaryBrown,
        shadowOpacity: 0.2, 
    },
    gridButtonText: {
        fontSize: 13,
        color: THEME_COLORS.PrimaryBrown,
        fontWeight: '500', 
        marginTop: 0, 
        textAlign: 'center',
    },
    gridButtonTextActive: {
        color: THEME_COLORS.CardBackground, 
        fontWeight: '600',
    },
    generateQuizButtonOverride: {
        paddingVertical: 14, 
        marginBottom: 15, 
        borderRadius: 10,
        backgroundColor: THEME_COLORS.AccentBrown,
        shadowColor: THEME_COLORS.PrimaryBrown,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    generateQuizButtonText: {
        fontSize: 17, 
        fontWeight: '700', 
        color: THEME_COLORS.CardBackground,
    },

    // --- Quiz Specific Styles ---
    questionContainer: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME_COLORS.BorderGray,
        marginBottom: 5,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '700',
        color: THEME_COLORS.PrimaryText,
        marginBottom: 10,
    },
    optionButton: { // New style added for question options
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: THEME_COLORS.Background,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME_COLORS.BorderGray,
        marginBottom: 10,
    },
    optionIcon: {
        marginRight: 10, 
    },
    optionText: { // Consolidated & refined
        flex: 1,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
    },
    correctAnswerText: {
        fontWeight: '700',
        backgroundColor: '#E6F0FF', // Keeping a light blue background for correctness
        borderRadius: 4,
    },
    explanationBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: THEME_COLORS.LightGray,
        borderRadius: 6,
    },
    explanationLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: THEME_COLORS.AccentBrown,
        marginBottom: 2,
    },
    explanationText: {
        fontSize: 14,
        color: THEME_COLORS.SecondaryText,
    },

    // --- Modal Styles (Consolidated & Refined) ---
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
    },
    modalView: {
        margin: 20,
        backgroundColor: THEME_COLORS.CardBackground,
        borderRadius: 10,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME_COLORS.LightGray,
        marginBottom: 10,
    },
    modalTitle: { // Consolidated & Refined
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText,
    },
    modalCloseButton: {
        padding: 5,
    },
    modalListContainer: {
        maxHeight: 300, 
        width: '100%',
    },
    modalListContent: {
        paddingVertical: 5,
    },
    modalListSeparator: {
        height: 1,
        backgroundColor: THEME_COLORS.LightGray,
        marginLeft: 40,
    },
    modalListItemRefined: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    modalListItemTextRefined: {
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
        flexShrink: 1,
    },
    modalEmptyListText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: THEME_COLORS.SecondaryText,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    modalSubtitle: { // Consolidated & Refined
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        color: THEME_COLORS.PrimaryText, // Using PrimaryText
    },
    input: {
        width: '100%',
        height: 45,
        borderColor: THEME_COLORS.LightGray,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: THEME_COLORS.PrimaryText, // Using PrimaryText
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        borderRadius: 8,
        padding: 10,
        elevation: 2,
        width: '48%',
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: THEME_COLORS.LightGray,
    },
    buttonSave: {
        backgroundColor: THEME_COLORS.PrimaryBrown,
    },
    textStyle: { // For modal buttons
        color: THEME_COLORS.PrimaryText, // Default to primary text
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Specific text style for the save button's white text
    saveButtonTextStyle: {
        color: THEME_COLORS.CardBackground, 
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // --- Reviewer List Card Styles ---
    reviewerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: THEME_COLORS.CardBackground,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    reviewerTextContainer: {
        flex: 1,
        marginRight: 10,
    },
    reviewerTitleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryText, // Using PrimaryText
    },
    reviewerDateText: {
        fontSize: 12,
        color: THEME_COLORS.SecondaryText,
        marginTop: 4,
    },
    deleteButtonContainer: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginRight: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        padding: 20,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: THEME_COLORS.SecondaryText,
        textAlign: 'center',
    },
    clearQuizIcon: {
        marginRight: 6, 
    },
    // Example Styles (Must be defined in your component's stylesheet)

// 1. Status Bar Style
inlineStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centers the content horizontally
    backgroundColor: '#F5EFE1', // Light background color from the image
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
},
statusText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.PrimaryBrown, // Use a contrasting color
},

// 2. Button and Input Styles (Ensuring correct loading appearance)
primaryButtonDisabled: {
    opacity: 0.6, // Dim the button when disabled
},
disabledInput: {
    backgroundColor: '#f0f0f0',
    // other visual cues...
}
// ... other styles like fileButton, inputArea, etc.
});

export default styles; 
export { THEME_COLORS };

