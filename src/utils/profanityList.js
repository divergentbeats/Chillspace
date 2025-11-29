// Profanity List for Chillspace Venting Venue
// Includes English, Hindi, and Kannada common offensive terms

const english = [
    "fuck", "shit", "bitch", "asshole", "bastard", "damn", "dick", "pussy", "cunt", "whore", "slut", "cock", "faggot", "nigger", "retard"
];

const hindi = [
    "madarchod", "bhenchod", "chutiya", "bhosdike", "gandu", "randi", "saala", "kutta", "kamina", "harami", "lauda", "lodu"
];

const kannada = [
    "sule", "boli", "magane", "shata", "key", "tullu", "tunne", "halka", "loafer", "bewarsi"
];

// Combine all lists
const allProfanity = [...english, ...hindi, ...kannada];

export const containsProfanity = (text) => {
    const lowerText = text.toLowerCase();
    const foundWords = [];

    allProfanity.forEach(word => {
        // Check for whole word matches or significant substrings
        // Using a simple includes check for now, but regex would be better for whole words
        // However, for Indian languages, transliteration varies, so simple includes might catch more variants
        if (lowerText.includes(word)) {
            foundWords.push(word);
        }
    });

    return foundWords.length > 0 ? foundWords : false;
};

export const censorText = (text) => {
    let censoredText = text;
    allProfanity.forEach(word => {
        const regex = new RegExp(word, "gi");
        censoredText = censoredText.replace(regex, "*".repeat(word.length));
    });
    return censoredText;
};
