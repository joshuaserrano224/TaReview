import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- ORIGINAL COLOR PALETTE ---
const COLORS = {
  background: '#F5F5DC', // Beige/Cream background
  primary: '#FFFFFF',    // White
  text: '#4B3F3C',       // Dark Brown text for contrast
  accent: '#A0522D',     // Sienna/Brown for buttons/highlights
  highlight: '#D4C6A8',  // Light accent color
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Main container now centers its primary content group
  container: {
    flex: 1,
    justifyContent: 'center', // Changed to 'center' to bring content down
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: height * 0.1, 
    position: 'relative', // Needed for absolute positioning of geometric elements
  },
  
  // --- Geometric Background Elements (New) ---
  geometricShape1: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: COLORS.highlight, // Use a lighter accent
    borderRadius: 20, // Sharp corners with a slight curve
    transform: [{ rotate: '45deg' }], // Rotate for diamond shape
    top: height * 0.15, // Position near top-left
    left: -75, // Halfway off screen for partial visibility
    opacity: 0.3, // Subtle
    // Soft shadow for depth
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  geometricShape2: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: COLORS.accent, // Use accent color
    borderRadius: 10, // Slightly sharper
    transform: [{ rotate: '-30deg' }], // Rotate in opposite direction
    bottom: height * 0.1, // Position near bottom-right
    right: -50, // Halfway off screen
    opacity: 0.2, // More subtle
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  // --- Logo Area ---
  logoArea: {
    alignItems: 'center',
    marginBottom: height * 0.1, // Adjusted margin to pull content down
    marginTop: -height * 0.1, // Slightly pull up if needed, or remove for more central
    zIndex: 1, // Ensure logo is above geometric shapes
  },
  appLogo: {
    fontSize: 58, 
    fontWeight: '800', 
    color: COLORS.accent, 
    letterSpacing: 2.5,
    textShadowColor: 'rgba(75, 63, 60, 0.2)', 
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  taglineText: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.text,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 30,
    maxWidth: width * 0.8, // Constrain width for better readability
  },
  
  // --- Call-to-Action (CTA) Button ---
  getStartedButton: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: COLORS.accent,
    padding: 24, 
    borderRadius: 16, 
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, 
    shadowRadius: 15,
    elevation: 18,
    marginBottom: 25,
    zIndex: 1, // Ensure button is above geometric shapes
  },
  getStartedButtonText: {
    color: COLORS.primary, 
    fontSize: 22,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // --- Footer/Login Link ---
  footerContainer: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1, // Ensure footer is above geometric shapes
  },
  footerLink: {
    fontSize: 16,
    color: COLORS.text,
    opacity: 0.7,
  },
  footerLinkAccent: {
    color: COLORS.accent, 
    fontWeight: '600',
  }
});

export default styles;
export { COLORS };

