import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// --- FILE SYSTEM IMPORTS ---
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { getReviewers, initDatabase } from "../../Services/Database";


// --- GEMINI API/FILE API IMPORTS ---
import { GoogleGenAI } from '@google/genai';


// --- DATABASE IMPORTS ---
import {
    getReviewerContent,
    insertQuizResult
} from '../../Services/Database';

// Assuming styles and THEME_COLORS are correctly imported from DashboardStyles.js/jsx
import styles, { THEME_COLORS } from './DashboardStyles';

// --- API CONFIGURATION ---
const getApiKey = () => {
    // ⚠️ IMPORTANT: Use a secure method (like environment variables) for production.
    // For this example, we check a global variable (e.g., in a Canvas environment) 
    // or use a local key for testing.
    
    const localKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (localKey && localKey.length > 0) return localKey;
    if (typeof __api_key !== 'undefined') return __api_key;
    return '';
};
const API_KEY = getApiKey();
// Use the recommended model for general tasks
const MODEL_NAME = process.env.EXPO_PUBLIC_MODEL_NAME;

// ⭐ Initialize the client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- TYPE DEFINITION (for structured JSON output) ---
const QUIZ_SCHEMA = {
    type: "OBJECT", 
    properties: {
        "title": { "type": "STRING", "description": "A descriptive title for the generated quiz." }, 
        "questions": { 
            "type": "ARRAY",
            "items": {
                type: "OBJECT",
                properties: {
                    "question": { "type": "STRING", "description": "The quiz question." },
                    "options": { 
                        "type": "ARRAY", 
                        "items": { "type": "STRING" },
                        "description": "The multiple choice options. This should be an empty array for Identification or True/False type questions."
                    },
                    "answer": { "type": "STRING", "description": "The single correct answer text. For Multiple Choice, this must match one of the options exactly." }, 
                    "explanation": { "type": "STRING", "description": "A brief explanation of why the answer is correct." }
                },
                required: ["question", "answer", "explanation"]
            }
        }
    },
    required: ["title", "questions"]
};



// =========================================================
// INTERACTIVE QUIZ OPTION COMPONENT (UPDATED - REMOVES A/B FOR T/F)
// =========================================================
const QuizOption = ({ option, optionIndex, isSelected, isSubmitted, isCorrectAnswer, isUserAnswer, onSelect }) => {
    
    // Calculate the letter prefix (A, B, C, D...)
    const optionLetter = String.fromCharCode(65 + optionIndex);
    
    // --- NEW LOGIC: Check if it's a standard True/False option ---
    const isTF = option.toLowerCase() === 'true' || option.toLowerCase() === 'false';
    
    let containerStyle = styles.optionButton;
    let iconName = "ellipse-outline"; // Default circle (radio button)
    let iconColor = THEME_COLORS.SecondaryText;
    
    if (isSelected) {
        containerStyle = { ...containerStyle, ...styles.optionButtonSelected };
        iconName = "ellipse"; // Filled circle when selected
        iconColor = THEME_COLORS.PrimaryBrown;
    }
    
    if (isSubmitted) {
        if (isCorrectAnswer) {
            containerStyle = { ...containerStyle, ...styles.correctAnswerBackground, borderColor: THEME_COLORS.SuccessGreen };
            iconName = "checkmark-circle";
            iconColor = THEME_COLORS.SuccessGreen;
        } else if (isUserAnswer) {
            containerStyle = { ...containerStyle, ...styles.wrongAnswerBackground, borderColor: THEME_COLORS.DangerRed };
            iconName = "close-circle";
            iconColor = THEME_COLORS.DangerRed;
        }
    }
    
    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onSelect}
            disabled={isSubmitted} 
        >
            {/* 1. ICON (Circle/Radio Button) */}
            <Ionicons name={iconName} size={18} color={iconColor} style={styles.optionIcon} />
            
            {/* 2. OPTION TEXT CONTAINER (Conditional Lettering) */}
            <Text style={styles.optionText}>
                {/* OMIT the A. / B. prefix if it's a True/False option */}
                {!isTF && <Text style={{ fontWeight: 'bold' }}>{optionLetter}. </Text>}
                {option}
            </Text>
        </TouchableOpacity>
    );
};

// =========================================================
// REVIEWER SELECTION MODAL COMPONENT (REFINED DESIGN)
// =========================================================

const ReviewerSelectionModal = ({ visible, onClose, reviewers, onSelectReviewer }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    
                    {/* Header with Title and Close Icon for better UX */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Study Guide</Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Ionicons name="close" size={24} color={THEME_COLORS.SecondaryText} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* List Area */}
                    <View style={styles.modalListContainer}>
                        {reviewers.length === 0 ? (
                            <Text style={styles.modalEmptyListText}>
                                <Ionicons name="folder-open-outline" size={18} color={THEME_COLORS.SecondaryText} /> 
                                {" "}No saved study guides found.
                            </Text>
                        ) : (
                            <FlatList
                                data={reviewers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity
                                        style={styles.modalListItemRefined} // 👈 NEW STYLE
                                        onPress={() => {
                                            onSelectReviewer(item.id, item.title);
                                            onClose();
                                        }}
                                    >
                                        <Ionicons 
                                            name="document-text-outline" 
                                            size={20} 
                                            color={THEME_COLORS.PrimaryBrown} 
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text style={styles.modalListItemTextRefined} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <Ionicons 
                                            name="chevron-forward-outline" 
                                            size={20} 
                                            color={THEME_COLORS.SecondaryText} 
                                            style={{ marginLeft: 'auto' }}
                                        />
                                    </TouchableOpacity>
                                )}
                                style={styles.modalList}
                                contentContainerStyle={styles.modalListContent} // 👈 NEW STYLE
                                ItemSeparatorComponent={() => <View style={styles.modalListSeparator} />} // 👈 NEW SEPARATOR
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
// =========================================================
// MAIN COMPONENT: QuizGenerator
// =========================================================
const QuizGenerator = ({ navigation , onQuizStatusChange}) => {
    
    const [studyMaterial, setStudyMaterial] = useState('');
    const [quizData, setQuizData] = useState(null); 
    const [quizOutput, setQuizOutput] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
        
    // Core Quiz States
    const [numQuestions, setNumQuestions] = useState('10'); 
    const [quizType, setQuizType] = useState('Multiple choice'); 
    const [userAnswers, setUserAnswers] = useState({}); 
    const [isSubmitted, setIsSubmitted] = useState(false); 
    const [score, setScore] = useState(null); 
    
    // FILE & DATABASE STATES
    const [fileName, setFileName] = useState(''); 
    const [uploadedFile, setUploadedFile] = useState(null); 
    
    const [reviewerList, setReviewerList] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReviewerId, setSelectedReviewerId] = useState(null);
    const isInputSectionBlurred = isLoading || isQuizActive; 
    

    // Define the available quiz types for the UI
    const quizTypes = [
        'Multiple choice', 
        'Identification', 
        'True or False', 
        'Mixed of all types'
    ];
    

    // ⭐ NEW EFFECT: Notify the parent whenever the quiz status changes
    


    // ⭐ NEW STATE: Derived value to control disabling and navigation
    const isQuizActive = quizData !== null; 
    
    // Combined control variable for disabling all input elements
    const disableInputControls = isLoading || isQuizActive;

   

    useEffect(() => {
        if (onQuizStatusChange) {
            onQuizStatusChange(isQuizActive);
        }
    }, [isQuizActive, onQuizStatusChange]);


    // ⭐ NEW FUNCTION: Dedicated function to clear the quiz and reset states
    const clearQuizState = () => {
        setQuizData(null); // Clears the generated quiz (THIS IS THE KEY TO RE-ENABLE CONTROLS)
        setQuizOutput('');
        setUserAnswers({}); 
        setIsSubmitted(false); 
        setScore(null); 
    };
    
    const clearInput = () => {
        setStudyMaterial('');
        setFileName('');
        setSelectedReviewerId(null);
        setUploadedFile(null); // Clear file data
    };

    // ⭐ NEW FUNCTIONALITY: Navigation Guard
    useEffect(() => {
        if (!navigation) return; // Exit if navigation prop is missing

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Only interrupt navigation if a quiz is active AND it hasn't been submitted
            if (!isQuizActive || isSubmitted) {
                return;
            }

            // Prevent default behavior of leaving the screen
            e.preventDefault(); 

            // Show confirmation alert
            Alert.alert(
                "Leave Quiz?",
                "Are you sure you want to leave this current state? Any progress is not saved",
                [
                    { text: "Cancel", style: "cancel", onPress: () => {} },
                    {
                        text: "Leave",
                        style: "destructive",
                        // If confirmed, clear the quiz state and dispatch the original navigation action
                        onPress: () => {
                             // Clear the quiz state so when they return it's fresh
                             clearQuizState(); 
                             navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });

        return unsubscribe; // Cleanup function
    }, [navigation, isQuizActive, isSubmitted]);


    // --- Original Functions Start Here ---

    // ... (EFFECT: Load Reviewers on Mount - unchanged)
    useEffect(() => {
        const loadReviewerList = async () => {
            try {
                await initDatabase(); 
                const raw = await AsyncStorage.getItem("currentUser");
                const user = raw ? JSON.parse(raw) : null;
                if (!user || !user.id) {
                    console.log("No current user found. Reviewer list skipped.");
                    setReviewerList([]);
                    return;
                }
                const list = await getReviewers(user.id);
                setReviewerList(list);
            } catch (e) {
                console.error("Failed to load reviewer list:", e);
            }
        };
        loadReviewerList();
    }, []); 

    // ... (Your other core handlers - unchanged)
    const handleAnswerSelect = (questionIndex, selectedOptionText) => {
        if (isSubmitted) return;
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [questionIndex]: selectedOptionText,
        }));
    };

    const saveScoreToDatabase = async (quizTitle, finalScore, totalQuestions) => {
        if (typeof insertQuizResult !== 'function') {
            Alert.alert('Save Error', 'Database function (insertQuizResult) is unavailable.');
            return;
        }
        try {
            await initDatabase(); 
            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;
            if (!user || !user.id) {
                Alert.alert('Login Required', 'Cannot save score. Please ensure you are logged in and your user profile has an ID.');
                console.error("Save Score Error: User object is invalid or missing ID.");
                return;
            }
            const resultId = await insertQuizResult({
                userId: user.id, 
                title: quizTitle,
                score: `${finalScore}/${totalQuestions}`,
                percentage: Math.round((finalScore / totalQuestions) * 100),
                date: new Date().toISOString(),
            });
            console.log('Quiz result saved with ID:', resultId, 'for User:', user.id);
        } catch (e) {
            console.error('Database Save Error:', e);
            Alert.alert('Save Error', 'Failed to save quiz results to the local database.');
        }
    };

    const calculateAndSubmit = () => {
        if (isSubmitted || !quizData || !quizData.questions) return;
        const totalQuestions = quizData.questions.length;
        const answeredCount = Object.keys(userAnswers).length;

        if (answeredCount < totalQuestions) {
             Alert.alert(
                 "Incomplete Quiz",
                 `You have only answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`,
                 [
                     { text: "Cancel", style: "cancel" },
                     { text: "Submit Anyway", style: "destructive", onPress: processSubmission }
                 ]
             );
        } else {
             Alert.alert(
                 "Confirm Submission",
                 "Are you sure you want to submit your answers? You cannot change them afterward.",
                 [
                     { text: "Cancel", style: "cancel" },
                     { text: "Submit", style: "default", onPress: processSubmission },
                 ]
             );
        }
    };

    const processSubmission = () => {
        let correctCount = 0;
        const totalQuestions = quizData.questions.length;

        quizData.questions.forEach((item, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer === item.answer) {
                correctCount++;
            }
        });

        setScore(correctCount);
        setIsSubmitted(true);
        saveScoreToDatabase(quizData.title || "Untitled Quiz", correctCount, totalQuestions);
        Alert.alert('Quiz Complete! 🎉', `Your score is ${correctCount} out of ${totalQuestions}.`);
    };

    // ... (Your file handling functions - minor change to clearInput)
    // NOTE: clearInput no longer clears quizData, only input material.
    
    const loadReviewerAsMaterial = async (id, title) => {
        setIsLoading(true);
        clearInput(); 
        try {
            await initDatabase(); 
            const raw = await AsyncStorage.getItem("currentUser");
            const user = raw ? JSON.parse(raw) : null;
            if (!user || !user.id) {
                setError("Authentication Error: User not found. Please log in again.");
                setIsLoading(false);
                return;
            }
            const reviewer = await getReviewerContent(id, user.id); 
            if (reviewer && reviewer.content) {
                setStudyMaterial(reviewer.content);
                setFileName(`SAVED: ${title}`);
                setSelectedReviewerId(id);
                setError(''); 
                console.log(`Successfully loaded reviewer ID: ${id} for user ID: ${user.id}`);
            } else {
                setError("Access Denied or Not Found: Could not retrieve the study guide content.");
                setStudyMaterial(''); 
                setFileName('');
            }
        } catch (e) {
            console.error("loadReviewerAsMaterial ERROR:", e);
            setError(`Failed to load saved study guide: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const pickDocument = async () => {
        setError('');
        setFileName('');
        setStudyMaterial('');
        setUploadedFile(null); 

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["*/*"],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const { uri, name, mimeType } = file;

            setFileName(name);
            setIsLoading(true);

            const rawBase64 = await FileSystem.readAsStringAsync(uri, {
                encoding: "base64"
            });
            
            setUploadedFile({
                uri,
                base64: rawBase64,
                name,
                mimeType: mimeType || "application/octet-stream"
            });

            setStudyMaterial("__file_selected__");
            setSelectedReviewerId(null); 
            Alert.alert("File Loaded", `${name} is ready for quiz generation.`);

        } catch (e) {
            console.log("File picker error:", e);
            setError(`File handling failed: ${e.message || e}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // ⭐ CORE FIX/UPDATE: Refined generateQuiz logic - added clearQuizState
    const generateQuiz = async () => {
        const isFileSelected = uploadedFile && studyMaterial === "__file_selected__";
        const isSavedReviewer = selectedReviewerId && studyMaterial && studyMaterial !== "__file_selected__";
        const isManualText = studyMaterial.trim().length >= 50 && studyMaterial !== "__file_selected__";
        
        const isValidInput = isFileSelected || isSavedReviewer || isManualText;

        if (!isValidInput) {
            setError("Please enter at least 50 characters, select a saved reviewer, or upload a non-empty file.");
            setQuizData(null); 
            return;
        }

        setIsLoading(true);
        setError("");
        setQuizOutput("");
        clearQuizState(); // ⭐ Reset the quiz state before generating a new one
        

        try {
            const parsedNum = parseInt(numQuestions);
            const questionCount = isNaN(parsedNum) || parsedNum <= 0 ? 10 : Math.min(parsedNum, 30); 
            
            let userQuery = `Generate a quiz with exactly ${questionCount} questions based on the provided material. The questions must be of the following type(s): **${quizType}**. The response MUST strictly follow the required JSON schema.`;
            
            if (quizType === 'Identification' || quizType === 'True or False') {
                userQuery += " For these types, the 'options' array in the JSON schema MUST be an empty array ([]) or omitted."
            }
            
            let parts = [{ text: userQuery }];
            
            if (isFileSelected && uploadedFile) { 
                parts.push({
                    inlineData: {
                        data: uploadedFile.base64,
                        mimeType: uploadedFile.mimeType || "application/octet-stream",
                    }
                });
                parts.push({ text: "The material to use for the quiz is the attached file." });
                
            } else if (isSavedReviewer || isManualText) {
                parts.push({ text: `Material: ${studyMaterial}` });
            }
            
            const response = await ai.models.generateContent({
                model: MODEL_NAME,
                contents: [{ role: "user", parts: parts }], 
                config: {
                    systemInstruction: "You are a professional quiz generator. Your sole task is to generate a JSON object conforming to the provided schema. Ensure 'answer' is the correct text. For Multiple Choice, 'answer' must exactly match one 'option'.",
                    responseMimeType: "application/json",
                    responseSchema: QUIZ_SCHEMA,
                },
            });

            const jsonText = response.text.trim();
            
            if (!jsonText || typeof jsonText !== "string") {
                throw new Error("Model returned no readable JSON text output or the response was empty.");
            }
            
            const parsedQuizObject = JSON.parse(jsonText); 
            
            setQuizData(parsedQuizObject); 
            setQuizOutput(jsonText); 
            
            Alert.alert("Quiz Generated! 🎉", `Successfully created ${parsedQuizObject.questions.length} questions.`);

        } catch (err) {
            console.error("Quiz Generation Error:", err);
            setError(`Quiz Generation Error: ${err.message || "An unknown error occurred during API call."}. Check console for details.`);
            setQuizData(null); 
        } finally {
            setIsLoading(false);
        }
    };


    // ... (Your renderInteractiveQuiz function - only changed one button's onPress)
    const renderInteractiveQuiz = () => {
        if (!quizData || !quizData.questions || quizData.questions.length === 0) return null;

        const totalQuestions = quizData.questions.length;
        const answeredCount = Object.keys(userAnswers).length;

        const isQuestionTrueOrFalse = (item) => {
            if (quizType === 'True or False') {
                return true;
            }

            if (quizType === 'Mixed of all types') {
                const hasTwoOptions = item.options && item.options.length === 2;
                const hasTfOptions = hasTwoOptions && 
                    item.options.some(opt => opt.toLowerCase() === 'true') && 
                    item.options.some(opt => opt.toLowerCase() === 'false');
                
                if (hasTfOptions || !item.options || item.options.length === 0) {
                   const answerLower = item.answer ? item.answer.toLowerCase() : '';
                   return hasTfOptions || answerLower === 'true' || answerLower === 'false';
                }
            }
            return false;
        };


        return (
            <View style={styles.resultsBox}>
                <Text style={styles.resultsHeader}>
                    {quizData.title || "Generated Quiz"} ({totalQuestions} Questions)
                </Text>
                
                {isSubmitted && (
                    <View style={styles.scoreBox}>
                        <Ionicons name="trophy" size={24} color={THEME_COLORS.PrimaryBrown} />
                        <Text style={styles.scoreText}>
                            Your Score: 
                            <Text style={{ fontWeight: 'bold' }}>{score}</Text> 
                            out of 
                            <Text style={{ fontWeight: 'bold' }}>{totalQuestions}</Text> 
                            (<Text style={{ fontWeight: 'bold' }}>{Math.round((score / totalQuestions) * 100)}%</Text>)
                        </Text>
                    </View>
                )}
                
                {quizData.questions.map((item, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = isSubmitted && userAnswer === item.answer;

                    const isTF = isQuestionTrueOrFalse(item);
                    const isMultipleChoice = item.options && item.options.length > 0 && !isTF;
                    const isIdentification = !isMultipleChoice && !isTF;


                    return (
                        <View key={index} style={styles.questionContainer}>
                            <Text style={styles.questionText}>
                                {index + 1}. {item.question}
                                {quizType === 'Mixed of all types' && (
                                    <Text style={{ color: THEME_COLORS.SecondaryText, fontSize: 14 }}>
                                        {isMultipleChoice ? ' (Multiple Choice)' : isTF ? ' (True/False)' : ' (Identification)'}
                                    </Text>
                                )}
                            </Text>
                            
                            {isTF ? (
                                ['True', 'False'].map((tfOption, tfIndex) => (
                                    <QuizOption 
                                        key={tfIndex}
                                        option={tfOption}
                                        optionIndex={tfIndex} 
                                        isSelected={userAnswer === tfOption} 
                                        isSubmitted={isSubmitted}
                                        isCorrectAnswer={item.answer === tfOption} 
                                        isUserAnswer={userAnswer === tfOption}
                                        onSelect={() => handleAnswerSelect(index, tfOption)}
                                    />
                                ))
                            ) : isMultipleChoice ? (
                                item.options.map((option, optIndex) => (
                                    <QuizOption 
                                        key={optIndex}
                                        option={option}
                                        optionIndex={optIndex}
                                        isSelected={userAnswer === option} 
                                        isSubmitted={isSubmitted}
                                        isCorrectAnswer={item.answer === option}
                                        isUserAnswer={userAnswer === option}
                                        onSelect={() => handleAnswerSelect(index, option)}
                                    />
                                ))
                            ) : isIdentification ? (
                                <TextInput
                                    style={styles.inputArea}
                                    placeholder="Type your answer here..."
                                    placeholderTextColor={THEME_COLORS.SecondaryText}
                                    onChangeText={(text) => handleAnswerSelect(index, text)}
                                    value={userAnswers[index]} 
                                    editable={!isSubmitted}
                                />
                            ) : null}

                            {isSubmitted && (
                                <View style={[
                                    styles.explanationBox, 
                                    isCorrect ? styles.correctAnswerBackground : styles.wrongAnswerBackground
                                ]}>
                                    <Text style={styles.explanationLabel}>
                                        <Text style={{fontWeight: '700'}}>{isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</Text>
                                    </Text>
                                    
                                    {!isCorrect && 
                                        <Text style={styles.explanationLabel}>
                                            Your Answer: <Text style={{fontWeight: '700'}}>{userAnswer || 'N/A'}</Text>
                                        </Text>
                                    }
                                    <Text style={styles.explanationLabel}>Correct Answer & Explanation:</Text>
                                    
                                    <Text style={styles.explanationText}>
                                        <Text style={{fontWeight: 'bold'}}>{item.answer}</Text>. {item.explanation}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* SUBMIT BUTTON */}
                <TouchableOpacity 
                    style={[
                        styles.primaryButton, 
                        { 
                            marginTop: 15, 
                            marginBottom: 5, 
                            opacity: isSubmitted ? 0.6 : 1,
                        }
                    ]}
                    onPress={calculateAndSubmit}
                    disabled={isSubmitted}
                >
                    <Text style={styles.primaryButtonText}>
                        {isSubmitted 
                            ? `Quiz Submitted (Score: ${score}/${totalQuestions})` 
                            : `Submit Quiz (${answeredCount}/${totalQuestions} Answered)`
                        }
                    </Text>
                </TouchableOpacity>
                
                {/* CLEAR QUIZ BUTTON */}
                <TouchableOpacity
                    style={[styles.linkButton, {marginBottom: 10}]}
                    onPress={clearQuizState} // ⭐ Changed onPress to call the new clearQuizState
                    disabled={isLoading}
                >
                    <Ionicons 
                        name="trash-bin-outline" 
                        size={18} 
                        color={THEME_COLORS.DangerRed} 
                        style={styles.clearQuizIcon}
                    />
                    <Text style={styles.linkButtonText}>Clear Quiz</Text>
                </TouchableOpacity>

            </View>
        );
    };

    // --- Main Render Function (Only added `disabled` and `editable` props) ---
   return (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.contentPadding}>
        
        {/* Main Header Text */}
        <Text style={{ fontSize: 22, fontWeight: '700', color: THEME_COLORS.PrimaryText, marginTop: 0 }}>
            Generate Quiz
        </Text>
        <Text style={styles.subtitle}>
            Upload a text file or paste notes below to instantly generate a comprehensive study guide.
        </Text>
        
        {/* Reviewer Selection Modal */}
        <ReviewerSelectionModal 
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            reviewers={reviewerList}
            onSelectReviewer={loadReviewerAsMaterial}
        />
        
        {/* ⭐ INLINE LOADING STATUS BAR (Matches the top banner in the image) */}
      

        {/* SECTION: Number of Questions Input */}
        <View style={[styles.inputRow, disableInputControls && styles.disabledContent]}>
            <Text style={styles.inputLabel}>
                Number of Questions (Max 30):
            </Text>
            <TextInput
                style={[styles.numberInput, disableInputControls && styles.disabledInput]}
                placeholder="10"
                placeholderTextColor={THEME_COLORS.SecondaryText}
                keyboardType="numeric"
                value={numQuestions}
                onChangeText={(text) => {
                    const cleanedText = text.replace(/[^0-9]/g, '');
                    const num = parseInt(cleanedText);
                    if (num > 30) {
                        setNumQuestions('30');
                    } else {
                        setNumQuestions(cleanedText);
                    }
                }}
                editable={!disableInputControls} 
            />
        </View>

        {/* SECTION: QUIZ TYPE SELECTION */}
        <View style={[styles.section, { marginBottom: 20 }, disableInputControls && styles.disabledContent]}>
            <Text style={styles.sectionTitle}>
                Quiz Type: <Text style={{ color: THEME_COLORS.A, fontWeight: 'bold' }}>{quizType}</Text>
            </Text>
            <View style={styles.gridContainer}>
                {quizTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.gridButton,
                            quizType === type ? styles.gridButtonActive : null,
                            disableInputControls && styles.disabledButton,
                        ]}
                        onPress={() => setQuizType(type)}
                        disabled={disableInputControls} 
                    >
                        <Text style={[
                            styles.gridButtonText,
                            quizType === type ? styles.gridButtonTextActive : null,
                            disableInputControls && styles.disabledText,
                        ]}>
                            {type}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
        
        {/* SECTION: Input Selection Buttons */}
        <View style={[styles.section, { marginBottom: 15 }, disableInputControls && styles.disabledContent]}>
            <Text style={styles.sectionTitle}>
                Material Source:
            </Text>
            <View style={styles.gridContainer}>
                
                {/* 1. SAVED REVIEWER BUTTON */}
                <TouchableOpacity 
                    style={[styles.gridButton, (disableInputControls || reviewerList.length === 0) && styles.disabledButton]}
                    onPress={() => setIsModalVisible(true)}
                    disabled={disableInputControls || reviewerList.length === 0}
                >
                    <Ionicons name="layers-outline" size={20} color={THEME_COLORS.PrimaryBrown} />
                    <Text style={styles.gridButtonText}>
                        Saved ({reviewerList.length})
                    </Text>
                </TouchableOpacity>

                {/* 2. FILE UPLOAD BUTTON */}
                <TouchableOpacity 
                    style={[styles.gridButton, disableInputControls && styles.disabledButton]}
                    onPress={pickDocument}
                    disabled={disableInputControls}
                >
                    <Ionicons name="cloud-upload-outline" size={20} color={THEME_COLORS.PrimaryBrown} />
                    <Text style={styles.gridButtonText}>
                        Upload File
                    </Text>
                </TouchableOpacity>
            </View>
        </View>


        {/* Display selected material source/Clear Button Group */}
        {(fileName || (studyMaterial && studyMaterial.trim().length > 0)) && (
            <View style={{ marginBottom: 15 }}>
                <View style={styles.fileStatusContainer}>
                    <Text style={styles.fileStatusText}>
                        {fileName ? `Source: ${fileName}` : `Source: Manual Text`}
                    </Text>
                    <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={clearInput}
                        disabled={isLoading}
                    >
                        <Ionicons name="close-circle-outline" size={18} color={THEME_COLORS.DangerRed} />
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        {/* Study Material Input Area */}
        <TextInput
            style={[styles.inputArea, { height: 150 }, disableInputControls && styles.disabledInput]}
            placeholder="Paste your study material here..."
            placeholderTextColor={THEME_COLORS.SecondaryText}
            multiline
            value={
                studyMaterial === "__file_selected__" ? `(File Selected: ${fileName})` 
                : selectedReviewerId ? `(Saved Reviewer: ${fileName})` 
                : studyMaterial
            }
            onChangeText={setStudyMaterial}
            editable={!disableInputControls && studyMaterial !== "__file_selected__" && !selectedReviewerId} 
        />
           {isLoading && (
            <View style={styles.inlineStatusBar}>
                <ActivityIndicator size="small" color={THEME_COLORS.PrimaryBrown} />
                <Text style={styles.statusText}>Generating Quiz... Please wait.</Text>
            </View>
        )}


        {/* ⭐ ACTION BUTTON (Matches the bottom button in the image) */}
        <TouchableOpacity 
            style={[
                styles.primaryButton, 
                styles.generateQuizButtonOverride, 
                disableInputControls && styles.primaryButtonDisabled
            ]}
            onPress={generateQuiz}
            disabled={disableInputControls}
        >
             
            {/* Content changes based on loading state */}

          
            {isLoading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.primaryButtonText}>Generate Quiz Questions</Text>
            )}
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={THEME_COLORS.DangerRed} />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        ) : null}

        {/* Generated Quiz Output */}
        {renderInteractiveQuiz()}

    </ScrollView>
);
};

export default QuizGenerator;