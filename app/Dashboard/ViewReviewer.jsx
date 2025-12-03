import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// ⬇️ PDF Imports ⬇️
import * as Print from 'expo-print';

import { getReviewerById } from "../../Services/Database";
import baseStyles, { THEME_COLORS } from './DashboardStyles';

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME_COLORS.PrimaryBackground,
    },
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 10,
        backgroundColor: THEME_COLORS.PrimaryBackground,
        justifyContent: 'space-between', 
    },
    backButton: { paddingRight: 15 },
    downloadButton: {
        paddingLeft: 15,
    }, 
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: THEME_COLORS.ErrorRed,
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
    },

    reviewerContentContainer: {
        backgroundColor: THEME_COLORS.White,
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },

    outputHeader: {
        fontSize: 26,
        fontWeight: 'bold',
        color: THEME_COLORS.PrimaryBrown,
        marginTop: 20,
        marginBottom: 10,
        lineHeight: 32,
    },
    outputSubHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME_COLORS.SecondaryBrown,
        marginTop: 15,
        marginBottom: 8,
        lineHeight: 28,
    },
    outputText: {
        fontSize: 16,
        color: THEME_COLORS.PrimaryText,
        lineHeight: 24,
        marginBottom: 8,
        flexShrink: 1,
    },
    outputListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    outputListBullet: {
        // Using a style for the bullet to control its appearance inline
        fontSize: 16,
        marginRight: 8,
    },

    boldText: { fontWeight: 'bold' },
});

const styles = { ...baseStyles, ...localStyles };

const PDF_STYLES = `
    body { font-family: sans-serif; padding: 20px; color: ${THEME_COLORS.PrimaryText}; }
    h1 { color: ${THEME_COLORS.PrimaryBrown}; font-size: 26px; margin-top: 20px; margin-bottom: 10px; }
    h2 { color: ${THEME_COLORS.SecondaryBrown}; font-size: 20px; margin-top: 15px; margin-bottom: 8px; }
    p { font-size: 16px; line-height: 1.5; margin-bottom: 8px; }
    ul { list-style-type: disc; padding-left: 20px; margin-bottom: 8px; }
    li { font-size: 16px; line-height: 1.5; margin-bottom: 4px; }
    strong { font-weight: bold; }
`;


export default function ViewReviewer() {
    const { reviewerId, title } = useLocalSearchParams();
    const navigation = useNavigation();

    const [reviewerContent, setReviewerContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleGoBack = () => navigation.goBack();

    useEffect(() => {
        navigation.setOptions({
            title: title || "Reviewer Details",
        });
    }, [navigation, title]);


    const fetchReviewerDetails = useCallback(async () => {
        try {
            if (!reviewerId) {
                setError("Reviewer ID is missing.");
                setIsLoading(false);
                return;
            }

            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;

            if (!user?.id) {
                setError("User not found.");
                setIsLoading(false);
                return;
            }

            const result = await getReviewerById(Number(reviewerId), user.id);

            const record = Array.isArray(result) ? result[0] : result;

            if (!record) {
                setError("Reviewer not found.");
            } else {
                setReviewerContent(record.content);
            }
        } catch (err) {
            console.log("Error loading reviewer:", err);
            setError("Failed to load reviewer.");
        } finally {
            setIsLoading(false);
        }
    }, [reviewerId]);


    useEffect(() => {
        fetchReviewerDetails();
    }, [fetchReviewerDetails]);


    // Converts Markdown-like content to HTML for PDF generation
    const contentToHtml = (content, docTitle) => {
        const lines = content.split("\n");
        let html = `<html><head><title>${docTitle}</title><style>${PDF_STYLES}</style></head><body><h1>${docTitle}</h1>`;

        let inList = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("# ")) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<h1>${trimmed.slice(2)}</h1>`;
            } else if (trimmed.startsWith("## ")) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<h2>${trimmed.slice(3)}</h2>`;
            } else if (trimmed.startsWith("* ")) {
                if (!inList) { html += '<ul>'; inList = true; }
                const listItemContent = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<li>${listItemContent}</li>`;
            } else if (trimmed.length > 0) {
                if (inList) { html += '</ul>'; inList = false; }
                const paragraphContent = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p>${paragraphContent}</p>`;
            } else {
                if (inList) { html += '</ul>'; inList = false; }
            }
        }

        if (inList) { html += '</ul>'; } 
        html += '</body></html>';
        return html;
    };


    const handleDownloadPdf = async () => {
        if (!reviewerContent) {
            Alert.alert("Error", "Reviewer content is not available for download.");
            return;
        }

        const pdfTitle = title || "Reviewer";
        const fileName = `${pdfTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        const htmlContent = contentToHtml(reviewerContent, pdfTitle);

        try {
            if (Platform.OS === 'web') {
                const { uri: tempPdfUri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
                
                if (tempPdfUri) {
                    const response = await fetch(tempPdfUri);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    Alert.alert("Download Initiated", `The PDF file '${fileName}' should have started downloading in your browser.`);
                } else {
                    Alert.alert("Error", "Failed to generate PDF URI for web download.");
                }
            } else {
                await Print.printAsync({
                    html: htmlContent,
                });
            }

        } catch (e) {
            console.error("PDF Download Error:", e);
            Alert.alert("Error", "Failed to generate or open save dialog for PDF.");
        }
    };

    // ========================= MARKDOWN RENDERER (Final check) ===========================
    const renderInlineMarkdown = (text) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;

        text.replace(boldRegex, (match, boldText, offset) => {
            if (offset > lastIndex) {
                // Push the plain string segment before the bold part
                parts.push(text.substring(lastIndex, offset));
            }
            // Push the bold Text component
            parts.push(<Text key={offset} style={styles.boldText}>{boldText}</Text>);
            lastIndex = offset + match.length;
        });

        if (lastIndex < text.length) {
            // Push any remaining plain string segment
            parts.push(text.substring(lastIndex));
        }

        // CRITICAL: Always return a single Text wrapper component containing all parts
        return <Text>{parts}</Text>;
    };

    const renderContent = (content) => {
        return content
            .split("\n")
            .map((line, i) => {
                const trimmed = line.trim();
                
                // FIX: Skip empty lines entirely
                if (trimmed.length === 0) {
                    return null;
                }

                if (trimmed.startsWith("# ")) {
                    return <Text key={`h1-${i}`} style={styles.outputHeader}>{trimmed.slice(2)}</Text>;
                }
                if (trimmed.startsWith("## ")) {
                    return <Text key={`h2-${i}`} style={styles.outputSubHeader}>{trimmed.slice(3)}</Text>;
                }
                
                // FIX APPLIED HERE: List Item Rendering
                if (trimmed.startsWith("* ")) {
                    // We must return a component that can contain the text
                    return (
                        <View key={`li-view-${i}`} style={styles.outputListItem}>
                            {/* The Text component containing the whole list item line */}
                            <Text style={styles.outputText}> 
                                {/* Bullet and space wrapped in a Text component */}
                                <Text style={styles.outputListBullet}>• </Text>
                                {/* The content, which is already a <Text> component from renderInlineMarkdown */}
                                {renderInlineMarkdown(trimmed.slice(2))}
                            </Text>
                        </View>
                    );
                }
                
                // Default text rendering (Paragraphs)
                return (
                    // Applying styles to the outer Text element, which wraps the content
                    <Text key={`p-${i}`} style={styles.outputText}>
                        {renderInlineMarkdown(trimmed)}
                    </Text>
                );
            })
            .filter(Boolean); // Filter out nulls
    };


    // ========================= UI STATES ===========================
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                {/* Added key to satisfy linter, though not strictly required here */}
                <ActivityIndicator key="spinner" size="large" /> 
                <Text key="loading-text">Loading reviewer...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={50} color="red" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* ⬇️ CUSTOM HEADER ⬇️ */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back-outline" size={30} color={THEME_COLORS.PrimaryBrown} />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleDownloadPdf} 
                    style={styles.downloadButton}
                    disabled={!reviewerContent} 
                >
                    <Ionicons name="download-outline" size={30} color={THEME_COLORS.PrimaryBrown} />
                </TouchableOpacity>

            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.reviewerContentContainer}>
                    {reviewerContent ? renderContent(reviewerContent) : null}
                </View>
            </ScrollView>
        </View>
    );
}