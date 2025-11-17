import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- COLOR PALETTE ---
const COLORS = {
  background: '#F5F5DC', // Beige/Cream background
  primary: '#FFFFFF',    // White
  text: '#4B3F3C',       // Dark Brown text for contrast
  accent: '#A0522D',     // Sienna/Brown for buttons/highlights
  highlight: '#D4C6A8',  // Light accent color for borders
  googleRed: '#DB4437',  // Standard Google brand color for icon/outline
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 25, 
    paddingTop: height * 0.10,
    paddingBottom: 30, 
    alignItems: 'center', 
    position: 'relative', 
    minHeight: height,
  },
  
  // --- Geometric Background Elements ---
  geometricShape1: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: COLORS.highlight,
    borderRadius: 15, 
    transform: [{ rotate: '30deg' }],
    top: height * 0.10, 
    left: -40,
    opacity: 0.2,
  },
  geometricShape2: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    transform: [{ rotate: '-60deg' }],
    bottom: height * 0.05,
    right: -30,
    opacity: 0.15,
  },

  // --- Header & Title ---
  header: {
    marginBottom: 15, 
    alignItems: 'center',
    zIndex: 1, 
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.accent,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 15, 
    textAlign: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 10, 
  },

  // --- Form & Input Styles ---
  formContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.primary, 
    borderRadius: 16,
    padding: 25, 
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, 
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1, 
    marginTop: 5, 
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: COLORS.background, 
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.highlight, 
  },
  
  // --- CUSTOM PICKER DISPLAY STYLE (Used by CustomPicker for the input box) ---
  customPickerDisplay: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    height: 48,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  customPickerText: {
    fontSize: 15,
    color: COLORS.text,
  },
  customPickerPlaceholder: {
    fontSize: 15,
    color: COLORS.text,
    opacity: 0.6, 
  },
  customPickerIcon: {
    color: COLORS.accent,
    fontSize: 20, 
  },
  // --- End Custom Picker Styles ---

  // ** Step Navigation Buttons Container **
  stepNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20, 
    gap: 10,
  },
  backButton: {
    flex: 1, 
    backgroundColor: COLORS.highlight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, 
    shadowRadius: 2,
  },
  backButtonText: {
    color: COLORS.text, 
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  nextButton: {
    flex: 1, 
    backgroundColor: COLORS.accent,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: COLORS.primary, 
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  
  // --- Other Buttons / Links ---
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.highlight,
    opacity: 0.7,
  },
  dividerText: {
    width: 30,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.8,
  },
  actionButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, 
    shadowRadius: 8,
    elevation: 10,
  },
  actionButtonText: {
    color: COLORS.primary, 
    fontSize: 17,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: COLORS.primary, 
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.highlight,
    marginTop: 0,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  googleButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  googleIcon: {
    fontSize: 18,
    color: COLORS.googleRed,
  },
  switchContainer: {
    marginTop: 20,
    alignItems: 'center',
    zIndex: 1, 
  },
  switchText: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
  },
  switchLink: {
    color: COLORS.accent, 
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default styles;
export { COLORS };

