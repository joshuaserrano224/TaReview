import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from 'expo-router';
import { db, insertReviewer } from '../../Services/Database';
// NOTE: Assuming your imported styles are correctly defining these look and feels
import styles, { THEME_COLORS } from './DashboardStyles';


// =========================================================
// --- MODAL STYLES DEFINITION (Remains Unchanged) ---
// =========================================================
const modalStyles = StyleSheet.create({
    centeredView: styles.centeredView,
    modalView: styles.modalView,
    modalTitle: styles.modalTitle,
    modalSubtitle: styles.modalSubtitle,
    input: styles.input,
    buttonContainer: styles.buttonContainer,
    button: styles.button,
    buttonCancel: styles.buttonCancel,
    buttonSave: styles.buttonSave,
    textStyle: styles.textStyle,
});


// --- API CONFIGURATION ---
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = process.env.EXPO_PUBLIC_MODEL_NAME;
// =========================================================
// --- CUSTOM TITLE MODAL COMPONENT (Remains Unchanged) ---
// =========================================================
const SaveTitleModal = ({ visible, onCancel, onSave, defaultTitle, reviewerText }) => {
    const [title, setTitle] = useState(defaultTitle);
    
    useEffect(() => {
        setTitle(defaultTitle);
    }, [defaultTitle]);

    const handleSave = () => {
        if (title.trim().length === 0) {
            Alert.alert("Title Required", "Please enter a title for your reviewer.");
            return;
        }
        onSave(title, reviewerText);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Title Your Reviewer</Text>
                    <Text style={modalStyles.modalSubtitle}>
                        Enter a memorable name for your study guide.
                    </Text>
                    <TextInput
                        style={modalStyles.input}
                        onChangeText={setTitle}
                        value={title}
                        placeholder="e.g., Chapter 5 Key Terms"
                        placeholderTextColor={THEME_COLORS.SecondaryText}
                    />
                    <View style={modalStyles.buttonContainer}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonCancel]}
                            onPress={onCancel}
                        >
                            <Text style={modalStyles.textStyle}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.buttonSave]}
                            onPress={handleSave}
                        >
                            <Text style={modalStyles.textStyle}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


// =========================================================
// --- REVIEWER DISPLAY COMPONENT (Remains Unchanged) ---
// =========================================================

// Helper function to handle inline formatting (bold, italic)
const parseMarkdownLine = (line) => {
    const segments = [];
    let remaining = line;

    // Regex for bold (**text**) and italic (*text*)
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(remaining)) !== null) {
        // 1. Add plain text before the match
        if (match.index > lastIndex) {
            segments.push({ type: 'text', content: remaining.substring(lastIndex, match.index) });
        }

        const fullMatch = match[0];
        let content = fullMatch.slice(2, -2); // Default to bold content
        let style = styles.boldText; // Default style

        if (fullMatch.startsWith('*') && fullMatch.endsWith('*') && !fullMatch.startsWith('**')) {
            content = fullMatch.slice(1, -1);
            style = styles.italicText;
        }

        // 2. Add the formatted text
        segments.push({ type: 'formatted', content, style });

        lastIndex = match.index + fullMatch.length;
    }

    // 3. Add any remaining plain text
    if (lastIndex < remaining.length) {
        segments.push({ type: 'text', content: remaining.substring(lastIndex) });
    }

    // Combine segments into React Text components
    return segments.map((seg, i) => (
        <Text key={i} style={seg.style || styles.outputText}>
            {seg.content}
        </Text>
    ));
};

const ReviewerDisplay = ({ reviewerText }) => {
    if (!reviewerText) return null;

    const lines = reviewerText.split('\n');
    
    return (
        <View style={styles.outputContainer}>
            {lines.map((line, index) => {
                let textStyle = styles.outputText;
                let isListItem = false;
                let content = line.trim();
                let icon = null;

                if (content.startsWith('##')) {
                    textStyle = styles.outputSubHeader;
                    content = content.replace(/^##\s*/, ''); // Remove ##
                } else if (content.startsWith('#')) {
                    textStyle = styles.outputHeader;
                    content = content.replace(/^#\s*/, ''); // Remove #
                } else if (content.startsWith('* ') || content.startsWith('- ')) {
                    isListItem = true;
                    // Use a visual icon for lists for better aesthetics
                    icon = <Ionicons name="ellipse" size={5} color={THEME_COLORS.PrimaryBrown} style={styles.bulletIcon} />;
                    content = content.replace(/^[\*-]\s*/, ''); // Remove markdown list marker
                    textStyle = styles.outputListItem;
                } else if (content.trim() === '') {
                    // Empty line for spacing
                    return <Text key={index} style={styles.outputSpacer} />;
                }
                
                // Handle regular paragraphs or remaining lines
                if (isListItem) {
                    return (
                        <View key={index} style={styles.listItemRow}>
                            {icon}
                            <Text style={textStyle}>
                                {parseMarkdownLine(content)}
                            </Text>
                        </View>
                    );
                } else {
                    return (
                        <Text key={index} style={textStyle}>
                            {parseMarkdownLine(content)}
                        </Text>
                    );
                }
            })}
        </View>
    );
};

// =========================================================
// --- MAIN COMPONENT (Updated) ---
// =========================================================
const ReviewGenerator = ({onReviewerStatusChange}) => {
    const [studyMaterial, setStudyMaterial] = useState('');
    const [reviewerText, setReviewerText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [dbReady, setDbReady] = useState(false);
    const [saveModalVisible, setSaveModalVisible] = useState(false);

    const [uploadedFile, setUploadedFile] = useState(null);
    const navigation = useNavigation();
    
    const defaultTitle = fileName
        ? `Reviewer: ${fileName.split('.')[0]}`
        : `Reviewer: ${new Date().toLocaleDateString()} Notes`;

    // ⭐ DERIVED STATE: Check if there is any unsaved input or output.
    const hasActiveContent =
        studyMaterial.length > 0 ||
        uploadedFile !== null ||
        reviewerText.length > 0;

    // ⭐ DERIVED STATE: Check if generation is in progress or a result is displayed
    const isReviewerActive = isLoading || reviewerText.length > 0;

    useEffect(() => {
        navigation.setOptions({
            headerStyle: {
                backgroundColor: THEME_COLORS.PrimaryBrown,
            },
            headerTintColor: 'white',
            headerBackTitle: '',
        });
    }, [navigation]);

    useEffect(() => {
        if (db) {
            setDbReady(true);
        } else {
            setTimeout(() => {
                if (db) setDbReady(true);
            }, 500);
        }
    }, []);

    // ⭐ EFFECT: Notify the parent whenever active content status changes
    useEffect(() => {
        if (onReviewerStatusChange) {
            onReviewerStatusChange(hasActiveContent);
        }
    }, [hasActiveContent, onReviewerStatusChange]);

    /**
     * Resets all input/output state variables, effectively clearing the form.
     */
    const clearReviewerState = () => {
        setStudyMaterial('');
        setReviewerText('');
        setError('');
        setFileName('');
        setUploadedFile(null);
        Alert.alert("Reviewer Cleared", "You can now generate a new reviewer.");
    };

    /**
     * Handles the 'Clear Reviewer' button press with confirmation.
     */
    const handleClearReviewer = () => {
        if (isLoading) return;

        Alert.alert(
            "Confirm Clear",
            "Are you sure you want to clear the current reviewer? Any unsaved content will be lost.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Clear",
                    onPress: clearReviewerState,
                    style: "destructive"
                }
            ],
            { cancelable: true }
        );
    };


    const pickDocument = async () => {
        // ⭐ LOCKOUT GUARD
        if (isReviewerActive) return;

        setError('');
        setFileName('');
        setUploadedFile(null);
        setStudyMaterial('');
        setReviewerText('');

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'text/plain',
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'image/*',
                    '*/*'
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets[0].uri) {
                const file = result.assets[0];
                const { uri, name, mimeType } = file;
                
                setFileName(name);
                setIsLoading(true);

                if (name.toLowerCase().endsWith(".txt") || mimeType === 'text/plain') {
                    const content = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                    setStudyMaterial(content);
                    Alert.alert("Text Loaded", `Content of ${name} loaded into the input box.`);
                    setUploadedFile(null);
                } else {
                    const base64 = await FileSystem.readAsStringAsync(uri, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                    
                    setUploadedFile({
                        base64,
                        name,
                        mimeType: mimeType || 'application/octet-stream'
                    });
                    
                    setStudyMaterial('');
                    Alert.alert("File Ready", `${name} is ready for AI analysis.`);
                }
            }
        } catch (e) {
            console.error('Document picker or file conversion error:', e);
            setError(`Could not process document: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const generateReviewer = async () => {
        // ⭐ LOCKOUT GUARD
        if (isLoading) return;

        if (!uploadedFile && studyMaterial.trim().length < 50) {
            setError('Please provide at least 50 characters of study material or upload a file.');
            setReviewerText('');
            return;
        }

        setIsLoading(true); // START LOADING
        setError('');
        setReviewerText('');

        try {
            const systemPrompt =
                "You are an expert academic tutor and content optimizer. Your task is to take raw study material and convert it into a well-structured, easy-to-read reviewer guide. The output must be perfectly clean and readable, using only standard Markdown. " +
                "**STRICTLY AVOID** HTML tags like <br>, complex ASCII tables, pipe characters (|), or excessive special characters. " +
                "The guide must include: 1. Key Concepts/Definitions using headers and bold text. 2. Summarized Main Points using clear bullet lists (- or *). 3. A very concise summarization of generated reviewer. Ensure all lists are simple and use only one level of bulleting where possible and i prohibit you using special characters in properly structuring the response like this *";

            const userQuery = studyMaterial
                ? `Generate a reviewer guide based on this text:\n\n${studyMaterial}`
                : "Generate a reviewer guide based on the uploaded file.";
            
            let parts = [{ text: userQuery }];

            if (uploadedFile?.base64) {
                const mime = uploadedFile.mimeType;

                parts.push({
                    inline_data: {
                        mime_type: mime,
                        data: uploadedFile.base64
                    }
                });
            }
            
            const payload = {
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    {
                        role: "user",
                        parts: parts
                    }
                ]
            };

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
            let response;
            let result;
            const maxRetries = 3;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    response = await fetch(apiUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        result = await response.json();
                        break;
                    } else if (response.status === 429 && i < maxRetries - 1) {
                        await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
                        continue;
                    } else {
                        const errorBody = await response.json().catch(() => ({}));
                        throw new Error(`API returned status ${response.status}: ${errorBody.error?.message || response.statusText}`);
                    }
                } catch (e) {
                    if (i === maxRetries - 1) throw e;
                    await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
                }
            }

            const generatedText =
                result?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (generatedText) {
                setReviewerText(generatedText);
                Alert.alert("Generation Complete 🎉", "Your study reviewer is ready!");
            } else {
                setError(result.error?.message || "Failed to generate reviewer.");
            }

        } catch (e) {
            console.error("API Error:", e);
            setError(`An unexpected error occurred: ${e.message}`);
        } finally {
            setIsLoading(false); // STOP LOADING
        }
    };

    const saveToDatabase = async (title, content) => {
        setSaveModalVisible(false);

        try {
            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;

            if (!user || !user.id) {
                Alert.alert("Error", "User is not logged in. Cannot save reviewer.");
                return;
            }

            console.log("➡️ Saving reviewer for user_id:", user.id);

            const newId = await insertReviewer({
                user_id: user.id,
                title,
                content,
            });

            console.log("Reviewer saved with ID:", newId);
            Alert.alert("Success 🎉", `Reviewer successfully saved as "${title}"!`);

        } catch (error) {
            console.error("Error saving reviewer:", error);
            Alert.alert("Save Error", "Failed to save the reviewer to the local database.");
        }
    };


    const handleSavePress = () => {
        // ⭐ LOCKOUT GUARD
        if (!isReviewerActive || !dbReady || !insertReviewer) {
            Alert.alert('Save Error', 'No reviewer content or service not ready.');
            return;
        }

        if (!reviewerText) {
            Alert.alert('Save Error', 'No reviewer content to save.');
            return;
        }

        setSaveModalVisible(true);
    };

    // --- MAIN RENDER ---
    return (
        <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentPadding}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: THEME_COLORS.PrimaryText, marginTop: 0 }}>
              Generate Reviewer
            </Text>
            <Text style={styles.subtitle}>
                Upload a text file or paste notes below to instantly generate a comprehensive study guide.
            </Text>

        
          
            {/* Display DB Status */}
            {!dbReady && (
                <View style={[styles.errorContainer, { backgroundColor: THEME_COLORS.LightGray, borderColor: THEME_COLORS.SecondaryText }]}>
                    <Ionicons name="alert-circle-outline" size={20} color={THEME_COLORS.SecondaryText} />
                    <Text style={[styles.errorText, { color: THEME_COLORS.SecondaryText }]}>
                        Database Initializing. Save button may be disabled briefly.
                    </Text>
                </View>
            )}
            
            {/* FILE UPLOAD BUTTON */}
            <TouchableOpacity
                style={[styles.secondaryButton, {marginBottom: fileName ? 8 : 20, opacity: isReviewerActive ? 0.5 : 1}]}
                onPress={pickDocument}
                disabled={isReviewerActive} // ⭐ DISABLED when active
            >
                <Ionicons name="cloud-upload-outline" size={20} color={THEME_COLORS.PrimaryBrown} />
                <Text style={styles.secondaryButtonText}>
                    {fileName ? `Change File (${fileName})` : 'Upload Text/PDF File'}
                </Text>
            </TouchableOpacity>

            {/* Display selected file name */}
            {fileName ? (
                <Text style={styles.fileStatusText}>
                    File loaded: <Text style={{fontWeight: 'bold'}}>{fileName}</Text>
                </Text>
            ) : null}

            {/* Study Material Input Area */}
            <TextInput
                style={[styles.inputArea, { opacity: isReviewerActive ? 0.7 : 1 }]}
                placeholder="Paste your study material here..."
                placeholderTextColor={THEME_COLORS.SecondaryText}
                multiline
                numberOfLines={10}
                value={studyMaterial}
                onChangeText={setStudyMaterial}
                editable={!isReviewerActive} // ⭐ DISABLED when active
            />
             {isLoading && (
                <View style={[styles.errorContainer, { backgroundColor: THEME_COLORS.PrimaryBrown + '20', borderColor: THEME_COLORS.PrimaryBrown, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                    <ActivityIndicator color={THEME_COLORS.PrimaryBrown} size="small" style={{ marginRight: 10 }} />
                    <Text style={[styles.errorText, { color: THEME_COLORS.PrimaryBrown, fontWeight: 'bold' }]}>
                        Generating Reviewer... Please wait.
                    </Text>
                </View>
            )}
            

            {/* Action Button */}
            <TouchableOpacity
                style={[styles.primaryButton, { opacity: isReviewerActive ? 0.6 : 1 }]}
                onPress={generateReviewer}
                disabled={isReviewerActive} // ⭐ DISABLED when active
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryButtonText}>Analyze & Generate Reviewer</Text>
                )}
            </TouchableOpacity>

            {/* Error Message (API/Input) */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={20} color="#900" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}
            

            {/* Generated Reviewer Output */}
            {reviewerText ? (
                <View style={styles.resultsBox}>
                    <Text style={styles.resultsHeader}>Generated Reviewer Guide</Text>
                    <ReviewerDisplay reviewerText={reviewerText} />

                    {/* ⭐ UPDATED BUTTON STACK (Save then Clear) */}
                    <View>
                        {/* SAVE BUTTON (First in stack) */}
                        <TouchableOpacity
                            style={[styles.secondaryButton, { marginTop: 15, opacity: dbReady ? 1 : 0.5 }]}
                            onPress={handleSavePress}
                            disabled={!dbReady || isLoading} 
                        >
                            <Ionicons name="save-outline" size={20} color={THEME_COLORS.PrimaryBrown} />
                            <Text style={styles.secondaryButtonText}>
                                {dbReady ? 'Save Reviewer' : 'Database Loading...'}
                            </Text>
                        </TouchableOpacity>

                        {/* ⭐ CLEAR BUTTON (Second in stack) */}
                        <TouchableOpacity
                            style={[
                                styles.secondaryButton, 
                                { 
                                    marginTop: 10, 
                                    backgroundColor: '#dc354520', 
                                    borderColor: '#dc3545' 
                                }
                            ]}
                            onPress={handleClearReviewer}
                            disabled={isLoading} // Allow clearing even if not saved, but prevent if actively loading
                        >
                            <Ionicons name="trash-outline" size={20} color="#dc3545" />
                            <Text style={[styles.secondaryButtonText, { color: '#dc3545' }]}>
                                Clear Reviewer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}

            {/* CUSTOM TITLE INPUT MODAL */}
            <SaveTitleModal
                visible={saveModalVisible}
                onCancel={() => setSaveModalVisible(false)}
                onSave={saveToDatabase}
                defaultTitle={defaultTitle}
                reviewerText={reviewerText}
            />

        </ScrollView>
    );
};

export default ReviewGenerator;