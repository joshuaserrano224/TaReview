// HomeScreen.js

import { Feather, Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
// IMPORTANT: Import the styles and THEME_COLORS
import styles, { THEME_COLORS } from './DashboardStyles';

// --- Reusable Feature Card Component (kept here or move to a 'Components' folder) ---
const FeatureCard = ({ title, icon, color, onPress, subtitle }) => (
    <TouchableOpacity 
        style={[styles.card, { borderLeftColor: color }]} 
        onPress={onPress}
    >
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
        <Text style={{ fontSize: 22, fontWeight: '700', color: THEME_COLORS.PrimaryText, marginTop: 0 }}>
            Good morning, {currentUser?.firstName || 'User'}!
        </Text>
        <Text style={styles.subtitle}>
            Ready to tackle your study materials?
        </Text>

        {/* Feature Cards Section */}
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

        {/* Quick Access List */}
        <Text style={styles.sectionHeader}>Your Progress</Text>
        
        {/* ✅ THE FIX IS HERE: Added onPress handler */}
        <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={() => navigate('QuizHistory')} 
        >
            <Feather name="bar-chart-2" size={20} color={THEME_COLORS.AccentBrown} />
            <Text style={styles.quickAccessText}>Quiz History & Scores</Text>
        </TouchableOpacity>
        
        {/* Saved Reviewers Screen (Already correct) */}
        <TouchableOpacity 
            style={styles.quickAccessItem}
            // The target string must match the case in DashboardScreen's switch statement
            onPress={() => navigate('SavedReviewersScreen')} 
        >
            <Feather name="folder" size={20} color={THEME_COLORS.AccentBrown} />
            <Text style={styles.quickAccessText}>Saved Review Guides</Text>
        </TouchableOpacity>
        
        
    </ScrollView>
);

export default HomeScreen;