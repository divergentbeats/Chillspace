import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Helper function to convert Base64 to ArrayBuffer
const base64ToArrayBuffer = (base64) => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

// Helper function to convert PCM audio to WAV format
const pcmToWav = (pcm16, sampleRate) => {
    const buffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(buffer);
    let offset = 0;

    function writeString(str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset++, str.charCodeAt(i));
        }
    }

    function writeUint32(val) {
        view.setUint32(offset, val, true);
        offset += 4;
    }

    function writeUint16(val) {
        view.setUint16(offset, val, true);
        offset += 2;
    }

    // RIFF chunk descriptor
    writeString('RIFF');
    writeUint32(36 + pcm16.length * 2);
    writeString('WAVE');

    // fmt chunk
    writeString('fmt ');
    writeUint32(16);
    writeUint16(1); // Audio format (1 = PCM)
    writeUint16(1); // Number of channels
    writeUint32(sampleRate); // Sample rate
    writeUint32(sampleRate * 2); // Byte rate
    writeUint16(2); // Block align
    writeUint16(16); // Bits per sample

    // data chunk
    writeString('data');
    writeUint32(pcm16.length * 2);
    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(offset, pcm16[i], true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
};

const translations = {
    'en-US': {
        tagline: "Your space to be heard. Write down your thoughts and we'll help you understand your mood.",
        rantLabel: "What's on your mind?",
        rantPlaceholder: "Start writing here...",
        analyzeBtn: "Analyze My Mood",
        generateQuizBtn: "Generate 5 Questions",
        quizTitle: "Answer these questions...",
        resultsTitle: "Analysis Results",
        stressLevelLabel: "Stress Level:",
        summaryLabel: "Summary:",
        emotionsTitle: "Key Emotions",
        dialogueTitle: "A Thoughtful Response",
        listenBtn: "Listen ✨",
        suggestionsTitle: "Helpful Suggestions:",
        affirmationTitle: "Daily Affirmation",
        generateAffirmationBtn: "Generate Affirmation ✨",
        loadingText: "Analyzing your thoughts...",
        errorText: "An error occurred. Please try again."
    },
    'es-ES': {
        tagline: "Tu espacio para ser escuchado. Escribe tus pensamientos y te ayudaremos a entender tu estado de ánimo.",
        rantLabel: "¿Qué tienes en mente?",
        rantPlaceholder: "Empieza a escribir aquí...",
        analyzeBtn: "Analizar Mi Estado de Ánimo",
        generateQuizBtn: "Generar 5 Preguntas",
        quizTitle: "Responde estas preguntas...",
        resultsTitle: "Resultados del Análisis",
        stressLevelLabel: "Nivel de Estrés:",
        summaryLabel: "Resumen:",
        emotionsTitle: "Emociones Clave",
        dialogueTitle: "Una Respuesta Reflexiva",
        listenBtn: "Escuchar ✨",
        suggestionsTitle: "Sugerencias Útiles:",
        affirmationTitle: "Afirmación Diaria",
        generateAffirmationBtn: "Generar Afirmación ✨",
        loadingText: "Analizando tus pensamientos...",
        errorText: "Ha ocurrido un error. Por favor, inténtalo de nuevo."
    },
    'fr-FR': {
        tagline: "Votre espace pour être entendu. Écrivez vos pensées et nous vous aiderons à comprendre votre humeur.",
        rantLabel: "Qu'est-ce qui vous préoccupe?",
        rantPlaceholder: "Commencez à écrire ici...",
        analyzeBtn: "Analyser Mon Humeur",
        generateQuizBtn: "Générer 5 Questions",
        quizTitle: "Répondez à ces questions...",
        resultsTitle: "Résultats de l'Analyse",
        stressLevelLabel: "Niveau de Stress:",
        summaryLabel: "Résumé:",
        emotionsTitle: "Émotions Clés",
        dialogueTitle: "Une Réponse Réfléchie",
        listenBtn: "Écouter ✨",
        suggestionsTitle: "Suggestions Utiles:",
        affirmationTitle: "Affirmation Quotidienne",
        generateAffirmationBtn: "Générer une Affirmation ✨",
        loadingText: "Analyse de vos pensées...",
        errorText: "Une erreur est survenue. Veuillez réessayer."
    },
    'de-DE': {
        tagline: "Dein Raum, um gehört zu werden. Schreib deine Gedanken auf und wir helfen dir, deine Stimmung zu verstehen.",
        rantLabel: "Was beschäftigt dich?",
        rantPlaceholder: "Schreib hier los...",
        analyzeBtn: "Stimmung Analysieren",
        generateQuizBtn: "5 Fragen Generieren",
        quizTitle: "Beantworte diese Fragen...",
        resultsTitle: "Analyse-Ergebnisse",
        stressLevelLabel: "Stress-Level:",
        summaryLabel: "Zusammenfassung:",
        emotionsTitle: "Schlüssel-Emotionen",
        dialogueTitle: "Eine Nachdenkliche Antwort",
        listenBtn: "Anhören ✨",
        suggestionsTitle: "Hilfreiche Vorschläge:",
        affirmationTitle: "Tägliche Affirmation",
        generateAffirmationBtn: "Affirmation Generieren ✨",
        loadingText: "Deine Gedanken werden analysiert...",
        errorText: "Ein Fehler ist aufgetreten. Bitte versuche es erneut."
    },
    'ja-JP': {
        tagline: "あなたの声を聞くための場所。考えを書き留めて、気分を理解するお手伝いをします。",
        rantLabel: "何を考えていますか？",
        rantPlaceholder: "ここに書き始めてください...",
        analyzeBtn: "気分を分析する",
        generateQuizBtn: "5つの質問を生成する",
        quizTitle: "これらの質問に答えてください...",
        resultsTitle: "分析結果",
        stressLevelLabel: "ストレスレベル:",
        summaryLabel: "要約:",
        emotionsTitle: "主要な感情",
        dialogueTitle: "思慮深い応答",
        listenBtn: "聴く ✨",
        suggestionsTitle: "役立つ提案:",
        affirmationTitle: "毎日のアファメーション",
        generateAffirmationBtn: "アファメーションを生成する ✨",
        loadingText: "あなたの思考を分析中...",
        errorText: "エラーが発生しました。もう一度お試しください。"
    },
    'zh-CN': {
        tagline: "一个倾听你的空间。写下你的想法，我们将帮助你了解你的心情。",
        rantLabel: "你在想什么？",
        rantPlaceholder: "从这里开始写...",
        analyzeBtn: "分析我的心情",
        generateQuizBtn: "生成5个问题",
        quizTitle: "回答这些问题...",
        resultsTitle: "分析结果",
        stressLevelLabel: "压力水平：",
        summaryLabel: "总结：",
        emotionsTitle: "关键情绪",
        dialogueTitle: "一个深思熟虑的回应",
        listenBtn: "听一听 ✨",
        suggestionsTitle: "有用的建议：",
        affirmationTitle: "每日肯定",
        generateAffirmationBtn: "生成肯定语 ✨",
        loadingText: "正在分析你的想法...",
        errorText: "发生了一个错误。请重试。"
    },
    'hi-IN': {
        tagline: "अपनी बात कहने का आपका स्थान। अपने विचार लिखें और हम आपके मूड को समझने में आपकी मदद करेंगे।",
        rantLabel: "आपके मन में क्या है?",
        rantPlaceholder: "यहाँ लिखना शुरू करें...",
        analyzeBtn: "मेरा मूड विश्लेषण करें",
        generateQuizBtn: "5 प्रश्न जनरेट करें",
        quizTitle: "इन प्रश्नों का उत्तर दें...",
        resultsTitle: "विश्लेषण के परिणाम",
        stressLevelLabel: "तनाव का स्तर:",
        summaryLabel: "सारांश:",
        emotionsTitle: "मुख्य भावनाएँ",
        dialogueTitle: "एक विचारशील प्रतिक्रिया",
        listenBtn: "सुनें ✨",
        suggestionsTitle: "मददगार सुझाव:",
        affirmationTitle: "रोज़ाना की पुष्टि",
        generateAffirmationBtn: "पुष्टि जनरेट करें ✨",
        loadingText: "आपके विचारों का विश्लेषण हो रहा है...",
        errorText: "एक त्रुटि हुई। कृपया फिर से प्रयास करें।"
    },
    'kn-IN': {
        tagline: "ನಿಮ್ಮ ಮಾತುಗಳಿಗೆ ಜಾಗ. ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಬರೆಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಮನಸ್ಥಿತಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಾವು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.",
        rantLabel: "ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ?",
        rantPlaceholder: "ಇಲ್ಲಿ ಬರೆಯಲು ಪ್ರಾರಂಭಿಸಿ...",
        analyzeBtn: "ನನ್ನ ಮನಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
        generateQuizBtn: "5 ಪ್ರಶ್ನೆಗಳನ್ನು ರಚಿಸಿ",
        quizTitle: "ಈ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ...",
        resultsTitle: "ವಿಶ್ಲೇಷಣೆಯ ಫಲಿತಾಂಶಗಳು",
        stressLevelLabel: "ಒತ್ತಡದ ಮಟ್ಟ:",
        summaryLabel: "ಸಾರಾಂಶ:",
        emotionsTitle: "ಪ್ರಮುಖ ಭಾವನೆಗಳು",
        dialogueTitle: "ಒಂದು ಚಿಂತನಶೀಲ ಪ್ರತಿಕ್ರಿಯೆ",
        listenBtn: "ಕೇಳಿ ✨",
        suggestionsTitle: "ಸಹಾಯಕಾರಿ ಸಲಹೆಗಳು:",
        affirmationTitle: "ದೈನಂದಿನ ದೃಢೀಕರಣ",
        generateAffirmationBtn: "ದೃಢೀಕರಣವನ್ನು ರಚಿಸಿ ✨",
        loadingText: "ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
        errorText: "ಒಂದು ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
    },
    'mr-IN': {
        tagline: "तुमच्या बोलण्यासाठीची जागा. तुमचे विचार लिहा आणि आम्ही तुम्हाला तुमच्या मन:स्थितीला समजून घेण्यास मदत करू.",
        rantLabel: "तुमच्या मनात काय आहे?",
        rantPlaceholder: "इथे लिहायला सुरुवात करा...",
        analyzeBtn: "माझी मन:स्थिती विश्लेषित करा",
        generateQuizBtn: "5 प्रश्न तयार करा",
        quizTitle: "या प्रश्नांची उत्तरे द्या...",
        resultsTitle: "विश्लेषण परिणाम",
        stressLevelLabel: "तणाव पातळी:",
        summaryLabel: "सारांश:",
        emotionsTitle: "मुख्य भावना",
        dialogueTitle: "एक विचारशील प्रतिसाद",
        listenBtn: "ऐका ✨",
        suggestionsTitle: "मदतशीर सूचना:",
        affirmationTitle: "दररोजची सकारात्मकता",
        generateAffirmationBtn: "सकारात्मकता तयार करा ✨",
        loadingText: "तुमच्या विचारांचे विश्लेषण करत आहोत...",
        errorText: "एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा."
    },
    'ta-IN': {
        tagline: "உங்கள் குரல் கேட்கும் இடம். உங்கள் எண்ணங்களை எழுதுங்கள், உங்கள் மனநிலையைப் புரிந்துகொள்ள நாங்கள் உதவுவோம்.",
        rantLabel: "உங்கள் மனதில் என்ன இருக்கிறது?",
        rantPlaceholder: "இங்கே எழுதத் தொடங்குங்கள்...",
        analyzeBtn: "என் மனநிலையை பகுப்பாய்வு செய்",
        generateQuizBtn: "5 கேள்விகளை உருவாக்கு",
        quizTitle: "இந்தக் கேள்விகளுக்குப் பதிலளி...",
        resultsTitle: "பகுப்பாய்வு முடிவுகள்",
        stressLevelLabel: "மன அழுத்த நிலை:",
        summaryLabel: "சுருக்கம்:",
        emotionsTitle: "முக்கிய உணர்வுகள்",
        dialogueTitle: "ஒரு சிந்தனைமிக்க பதில்",
        listenBtn: "கேள் ✨",
        suggestionsTitle: "உதவிகரமான ஆலோசனைகள்:",
        affirmationTitle: "தினசரி உறுதிமொழி",
        generateAffirmationBtn: "உறுதிமொழியை உருவாக்கு ✨",
        loadingText: "உங்கள் எண்ணங்களை பகுப்பாய்வு செய்கிறோம்...",
        errorText: "ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்."
    },
    'te-IN': {
        tagline: "మీ మాటలు వినే స్థలం. మీ ఆలోచనలను వ్రాసి, మీ మూడ్‌ను అర్థం చేసుకోవడంలో మేము మీకు సహాయం చేస్తాము.",
        rantLabel: "మీ మనసులో ఏముంది?",
        rantPlaceholder: "ఇక్కడ రాయడం ప్రారంభించండి...",
        analyzeBtn: "నా మూడ్‌ను విశ్లేషించండి",
        generateQuizBtn: "5 ప్రశ్నలను సృష్టించండి",
        quizTitle: "ఈ ప్రశ్నలకు సమాధానం ఇవ్వండి...",
        resultsTitle: "విశ్లేషణ ఫలితాలు",
        stressLevelLabel: "ఒత్తిడి స్థాయి:",
        summaryLabel: "సారాంశం:",
        emotionsTitle: "ప్రధాన భావోద్వేగాలు",
        dialogueTitle: "ఒక ఆలోచనాత్మక ప్రతిస్పందన",
        listenBtn: "విను ✨",
        suggestionsTitle: "సహాయకరమైన సూచనలు:",
        affirmationTitle: "రోజువారీ ధృవీకరణ",
        generateAffirmationBtn: "ధృవీకరణను సృష్టించండి ✨",
        loadingText: "మీ ఆలోచనలను విశ్లేషిస్తున్నాము...",
        errorText: "ఒక లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి."
    },
    'ml-IN': {
        tagline: "നിങ്ങളുടെ ചിന്തകൾ പങ്കുവെക്കാനുള്ള ഇടം. നിങ്ങളുടെ ചിന്തകൾ എഴുതുക, നിങ്ങളുടെ മാനസികാവസ്ഥ മനസ്സിലാക്കാൻ ഞങ്ങൾ സഹായിക്കും.",
        rantLabel: "നിങ്ങളുടെ മനസ്സിൽ എന്താണ്?",
        rantPlaceholder: "ഇവിടെ എഴുതാൻ തുടങ്ങുക...",
        analyzeBtn: "എന്റെ മാനസികാവസ്ഥ വിശകലനം ചെയ്യുക",
        generateQuizBtn: "5 ചോദ്യങ്ങൾ സൃഷ്ടിക്കുക",
        quizTitle: "ഈ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക...",
        resultsTitle: "വിശകലന ഫലങ്ങൾ",
        stressLevelLabel: "സമ്മർദ്ദ നില:",
        summaryLabel: "സംഗ്രഹം:",
        emotionsTitle: "പ്രധാന വികാരങ്ങൾ",
        dialogueTitle: "ഒരു വിവേകപൂർണ്ണമായ പ്രതികരണം",
        listenBtn: "കേൾക്കൂ ✨",
        suggestionsTitle: "സഹായകരമായ നിർദ്ദേശങ്ങൾ:",
        affirmationTitle: "ദൈനംദിന സ്ഥിരീകരണം",
        generateAffirmationBtn: "സ്ഥിരീകരണം സൃഷ്ടിക്കുക ✨",
        loadingText: "നിങ്ങളുടെ ചിന്തകൾ വിശകലനം ചെയ്യുന്നു...",
        errorText: "ഒരു പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക."
    }
};

const ttsVoiceMap = {
    'en-US': "Kore",
    'es-ES': "Kore",
    'fr-FR': "Kore",
    'de-DE': "Kore",
    'ja-JP': "Kore",
    'zh-CN': "Kore",
    'hi-IN': "Kore",
    'kn-IN': "Kore",
    'mr-IN': "Kore",
    'ta-IN': "Kore",
    'te-IN': "Kore",
    'ml-IN': "Kore",
};

const languageNames = {
    'en-US': 'English (US)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'ja-JP': 'Japanese',
    'zh-CN': 'Chinese (Simplified)',
    'hi-IN': 'Hindi',
    'kn-IN': 'Kannada',
    'mr-IN': 'Marathi',
    'ta-IN': 'Tamil',
    'te-IN': 'Telugu',
    'ml-IN': 'Malayalam'
};

const MoodAnalyzer = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { user, loading: authLoading } = useAuth();
    const [language, setLanguage] = useState('en-US');
    const [translationsCurrent, setTranslationsCurrent] = useState(translations['en-US']);
    const [rant, setRant] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [affirmation, setAffirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const audioRef = useRef(null);
    const [showQuiz, setShowQuiz] = useState(false);

    // Update translations when language changes
    useEffect(() => {
        if (translations[language]) {
            setTranslationsCurrent(translations[language]);
        }
    }, [language]);

    // Handle language change
    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setShowQuiz(false);
        setRant('');
        setResults(null);
    };

    // Local Mood Analysis Logic
    const analyzeMoodLocally = (text) => {
        const lowerText = text.toLowerCase();
        let stressLevel = 50;
        let moodSummary = "You seem to be feeling neutral.";
        let keyEmotions = ["Neutral"];
        let helpfulDialogue = "It's okay to feel this way. Take a moment to breathe.";
        let helpfulSuggestions = ["Take a deep breath", "Drink some water", "Stretch for 5 minutes"];

        // Keywords
        const positiveWords = ['happy', 'joy', 'great', 'good', 'excited', 'love', 'awesome', 'wonderful', 'calm', 'peace'];
        const negativeWords = ['sad', 'depressed', 'bad', 'lonely', 'tired', 'angry', 'upset', 'hate', 'cry', 'pain'];
        const anxiousWords = ['worried', 'nervous', 'stress', 'panic', 'fear', 'anxiety', 'overwhelmed', 'busy', 'deadline'];

        let positiveCount = 0;
        let negativeCount = 0;
        let anxiousCount = 0;

        positiveWords.forEach(w => { if (lowerText.includes(w)) positiveCount++; });
        negativeWords.forEach(w => { if (lowerText.includes(w)) negativeCount++; });
        anxiousWords.forEach(w => { if (lowerText.includes(w)) anxiousCount++; });

        if (positiveCount > negativeCount && positiveCount > anxiousCount) {
            stressLevel = Math.max(10, 30 - (positiveCount * 5));
            moodSummary = "You seem to be in a good place! Keep up the positive vibes.";
            keyEmotions = ["Happy", "Content", "Optimistic"];
            helpfulDialogue = "It's wonderful to hear that you're feeling good! embracing these moments builds resilience.";
            helpfulSuggestions = ["Share your joy with a friend", "Write down what went well", "Enjoy the moment"];
        } else if (negativeCount > positiveCount && negativeCount > anxiousCount) {
            stressLevel = Math.min(90, 60 + (negativeCount * 5));
            moodSummary = "It sounds like you're going through a tough time.";
            keyEmotions = ["Sad", "Low Energy", "Reflective"];
            helpfulDialogue = "I hear you. It's completely valid to feel this way. Be gentle with yourself right now.";
            helpfulSuggestions = ["Talk to someone you trust", "Do something small that brings comfort", "Rest if you need to"];
        } else if (anxiousCount > 0) {
            stressLevel = Math.min(95, 70 + (anxiousCount * 5));
            moodSummary = "You seem to be feeling a bit overwhelmed or anxious.";
            keyEmotions = ["Anxious", "Stressed", "Overwhelmed"];
            helpfulDialogue = "Take a deep breath. You are handling a lot, and it's okay to pause.";
            helpfulSuggestions = ["Practice 4-7-8 breathing", "Write down your worries", "Focus on one small task"];
        }

        return {
            stressLevel,
            moodSummary,
            keyEmotions,
            helpfulDialogue,
            helpfulSuggestions
        };
    };

    // Analyze Mood API call (Replaced with Local)
    const analyzeMood = async () => {
        let userText = '';
        if (!showQuiz) {
            userText = rant.trim();
        } else {
            userText = quizQuestions.map((q) => {
                const answer = quizAnswers[q.id] || '';
                return `Question: ${q.question}\nAnswer: ${answer}\n\n`;
            }).join('');
        }
        
        if (!userText) {
             setError(translationsCurrent.errorText);
             return;
        };

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const result = analyzeMoodLocally(userText);
            setResults(result);
        } catch (e) {
            console.error('Analysis Error:', e);
            setError(translationsCurrent.errorText);
        } finally {
            setLoading(false);
        }
    };

    // Generate Affirmation API call (Replaced with Local)
    const generateAffirmation = async () => {
        setLoading(true);
        setError(null);

        const affirmations = [
            "I am capable of handling whatever comes my way.",
            "I choose to focus on what I can control.",
            "My peace is my priority.",
            "I am enough just as I am.",
            "Every breath is a new beginning.",
            "I trust the process of life.",
            "I am stronger than I think.",
            "I give myself permission to rest."
        ];

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
            setAffirmation(randomAffirmation);
        } catch (e) {
            console.error('Affirmation Error:', e);
            setAffirmation('Failed to generate affirmation.');
        } finally {
            setLoading(false);
        }
    };

    // Play Dialogue TTS API call (Replaced with Web Speech API)
    const playDialogue = async () => {
        if (!results || !results.helpfulDialogue) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(results.helpfulDialogue);
        
        // Try to set a voice based on language
        const voices = window.speechSynthesis.getVoices();
        const langCode = language.split('-')[0]; // e.g., 'en' from 'en-US'
        const voice = voices.find(v => v.lang.startsWith(langCode));
        if (voice) utterance.voice = voice;

        utterance.rate = 0.9; // Slightly slower for calming effect
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
    };

    // Generate Quiz API call (Replaced with Local)
    const generateQuiz = async () => {
        setLoading(true);
        setError(null);

        const localQuestions = [
            { id: 1, question: "How have you been sleeping lately?" },
            { id: 2, question: "What's one thing that's been on your mind the most?" },
            { id: 3, question: "Have you felt able to relax in the last 24 hours?" },
            { id: 4, question: "What is one emotion you've felt strongly today?" },
            { id: 5, question: "What's one small thing that would make you feel better right now?" }
        ];
        
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setQuizQuestions(localQuestions);
            setShowQuiz(true);
            setQuizAnswers({});
            setResults(null);
        } catch (e) {
            console.error('Quiz Generation Error:', e);
            setError(translationsCurrent.errorText);
        } finally {
            setLoading(false);
        }
    };

    // Handle quiz answer change
    const handleQuizAnswerChange = (id, value) => {
        setQuizAnswers(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className={`flex items-center justify-center min-h-screen p-4 bg-gray-900`}>
            <div className="bg-gray-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col items-center space-y-8 border border-gray-700">
                {/* Header & Language Selector */}
                <header className="text-center space-y-2 w-full flex flex-col items-center relative">
                    <img
                        src="/logo.png"
                        alt="Chillspace Logo"
                        className="cursor-pointer w-12 h-12 mb-2"
                        onClick={() => navigate('/')}
                    />
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Mindful AI
                    </h1>
                    <p className="text-gray-400 font-medium">{translationsCurrent.tagline}</p>
                    <div className="mt-4">
                        <label htmlFor="language-select" className="sr-only">Choose a language</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={handleLanguageChange}
                            className="p-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {Object.keys(translations).map(lang => (
                                <option key={lang} value={lang}>{languageNames[lang]}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {/* Input Section */}
                {!showQuiz && (
                    <div className="w-full space-y-4">
                        <label htmlFor="rant" className="block text-gray-300 font-medium">{translationsCurrent.rantLabel}</label>
                        <textarea
                            id="rant"
                            rows={6}
                            className="w-full p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                            placeholder={translationsCurrent.rantPlaceholder}
                            value={rant}
                            onChange={(e) => setRant(e.target.value)}
                        />
                    </div>
                )}

                {/* Quiz Section */}
                {showQuiz && (
                    <div className="w-full space-y-4">
                        <h3 className="text-xl font-bold text-gray-300">{translationsCurrent.quizTitle}</h3>
                        <ul className="space-y-4">
                            {quizQuestions.map((q) => (
                                <li key={q.id} className="space-y-2">
                                    <p className="text-gray-300 font-medium">Q: {q.question}</p>
                                    <textarea
                                        rows={3}
                                        className="w-full p-4 bg-gray-700 text-gray-100 border border-gray-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                                        placeholder="Your answer here..."
                                        value={quizAnswers[q.id] || ''}
                                        onChange={(e) => handleQuizAnswerChange(q.id, e.target.value)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="w-full flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <button
                        onClick={analyzeMood}
                        disabled={loading || (!showQuiz && !rant.trim()) || (showQuiz && Object.keys(quizAnswers).length < quizQuestions.length)}
                        className="w-full md:w-auto flex-1 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {translationsCurrent.analyzeBtn}
                    </button>
                    <button
                        onClick={generateQuiz}
                        disabled={loading}
                        className="w-full md:w-auto flex-1 px-8 py-4 bg-gray-700 text-gray-200 font-bold rounded-full shadow-lg border border-gray-600 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {translationsCurrent.generateQuizBtn}
                    </button>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex flex-col items-center justify-center p-8">
                        <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4 text-gray-400 font-medium">{translationsCurrent.loadingText}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="text-center text-red-400 font-medium mt-4">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {results && (
                    <div className="w-full space-y-6 mt-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-100">{translationsCurrent.resultsTitle}</h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-2 rounded-full"></div>
                        </div>

                        {/* Mood Stats Card */}
                        <div className="bg-gray-700 border border-gray-600 rounded-2xl p-6 md:p-8 shadow-inner space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-400">{translationsCurrent.stressLevelLabel}</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{results.stressLevel}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-gray-600 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${results.stressLevel}%`,
                                        backgroundColor:
                                            results.stressLevel < 40 ? '#22c55e' :
                                            results.stressLevel < 75 ? '#facc15' : '#ef4444'
                                    }}
                                ></div>
                            </div>
                            <div className="text-gray-400 font-medium">
                                <span className="font-semibold text-gray-300">{translationsCurrent.summaryLabel}</span>
                                <p className="mt-1">{results.moodSummary}</p>
                            </div>
                        </div>

                        {/* Keywords Card */}
                        <div className="bg-gray-700 border border-gray-600 rounded-2xl p-6 md:p-8 shadow-inner space-y-4">
                            <h3 className="text-xl font-bold text-gray-300">{translationsCurrent.emotionsTitle}</h3>
                            <ul className="flex flex-wrap gap-2 text-sm font-medium">
                                {results.keyEmotions.map((emotion, idx) => (
                                    <li key={idx} className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full shadow-sm">{emotion}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Helpful Dialogue & Suggestions Card */}
                        <div className="bg-gray-700 border border-gray-600 rounded-2xl p-6 md:p-8 shadow-inner space-y-4">
                            <div className="flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                </svg>
                                <h3 className="text-xl font-bold text-gray-300">{translationsCurrent.dialogueTitle}</h3>
                                <button
                                    onClick={playDialogue}
                                    disabled={loading}
                                    className="ml-auto flex items-center px-4 py-2 bg-purple-500 text-white font-bold rounded-full shadow-lg hover:bg-purple-600 focus:outline-none transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                                    {translationsCurrent.listenBtn}
                                </button>
                            </div>
                            <p className="text-gray-400 leading-relaxed italic">{results.helpfulDialogue}</p>
                            <div className="pt-4">
                                <h4 className="text-lg font-bold text-gray-300">{translationsCurrent.suggestionsTitle}</h4>
                                <ul className="list-disc list-inside space-y-1 mt-2 text-gray-400">
                                    {results.helpfulSuggestions.map((suggestion, idx) => (
                                        <li key={idx}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Affirmation Card */}
                        <div className="bg-gray-700 border border-gray-600 rounded-2xl p-6 md:p-8 shadow-inner space-y-4">
                            <h3 className="text-xl font-bold text-gray-300">{translationsCurrent.affirmationTitle}</h3>
                            <p className="text-gray-400 leading-relaxed italic">{affirmation}</p>
                            <button
                                onClick={generateAffirmation}
                                disabled={loading}
                                className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-full shadow-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {translationsCurrent.generateAffirmationBtn}
                            </button>
                        </div>
                    </div>
                )}
                <audio ref={audioRef} className="hidden"></audio>
            </div>
        </div>
    );
};

export default MoodAnalyzer;
