const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Load Q&A and Comparison Data
const qaData = require("./platform_qa.json");
const comparisonData = require("./platform_comparison.json");

// Platforms list
const platforms = ["Segment", "mParticle", "Lytics", "Zeotap"];
const fuzzyThreshold = 0.85; // Adjust typo tolerance

// Function to check if a question is a comparison
function isComparisonQuestion(question) {
    return ["compare", "difference", "vs", "versus", "differ"].some(word => question.toLowerCase().includes(word));
}

// Function to extract platforms from the question
function extractPlatforms(question) {
    return platforms.filter(platform => question.includes(platform));
}

// Function to fetch comparison details between two platforms
function getComparison(platform1, platform2) {
    let comparisons = [];
    
    Object.keys(comparisonData).forEach((feature) => {
        if (comparisonData[feature][platform1] && comparisonData[feature][platform2]) {
            comparisons.push({
                feature: feature,
                answer: `**Feature: ${feature}**\n- **${platform1}**: ${comparisonData[feature][platform1]}\n- **${platform2}**: ${comparisonData[feature][platform2]}`
            });
        }
    });
    return comparisons;
}

// Function to detect platform in a question
function detectPlatform(question) {
    const words = question.toLowerCase().split(/\W+/);
    
    for (let platform of platforms) {
        const lowerPlatform = platform.toLowerCase();
        if (words.includes(lowerPlatform)) return platform;
        for (let word of words) {
            if (getSimilarity(word, lowerPlatform) >= fuzzyThreshold) return platform;
        }
    }
    return null;
}

// Function to validate if a question is meaningful
function isValidQuestion(question) {
    const keywords = ["integrate", "setup", "track", "export", "audience", "event", "sync", "collect", "configure", "analytics"];
    return keywords.some(word => question.toLowerCase().includes(word));
}

// Function to search Q&A data
function searchQA(selectedPlatform, question) {
    const detectedPlatform = detectPlatform(question);

    if (detectedPlatform && detectedPlatform !== selectedPlatform) {
        return [{ answer: `Platform mismatch detected! You selected **${selectedPlatform}**, but your question is about **${detectedPlatform}**. Please select the correct platform and try again.` }];
    }

    if (!isValidQuestion(question)) {
        return [{ answer: "I'm sorry, but I couldn't find a relevant answer to your question." }];
    }

    const searchPlatform = detectedPlatform || selectedPlatform;
    const platformData = qaData[searchPlatform];
    if (!platformData) return [{ answer: `No relevant information found for ${searchPlatform}.` }];

    const words = question.toLowerCase().split(" ");
    const results = platformData.filter(entry => {
        const storedWords = entry.question.toLowerCase().split(" ");
        const matchCount = words.filter(word => storedWords.includes(word)).length;
        return (matchCount / words.length) > 0.5;
    }).map(entry => ({ answer: entry.answer }));

    return results.length > 0 ? results : [{ answer: "No relevant answer found." }];
}

// Helper function: Calculate string similarity using Levenshtein distance
function getSimilarity(s1, s2) {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - levenshteinDistance(longer, shorter)) / parseFloat(longer.length);
}

// Levenshtein Distance function
function levenshteinDistance(s1, s2) {
    const matrix = Array.from({ length: s1.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= s2.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            matrix[i][j] = s1[i - 1] === s2[j - 1] 
                ? matrix[i - 1][j - 1]
                : Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + 1);
        }
    }
    return matrix[s1.length][s2.length];
}

// API Route to Process Queries
app.post("/api/query", (req, res) => {
    const { question, platform } = req.body;

    // Handle Comparative Questions
    if (isComparisonQuestion(question)) {
        const extractedPlatforms = extractPlatforms(question);
        console.log("Extracted Platforms:", extractedPlatforms);

        if (extractedPlatforms.length === 2) {
            const results = getComparison(extractedPlatforms[0], extractedPlatforms[1]);
            console.log("Comparison Results:", results);

            return res.json({ answers: results.length > 0 ? results : [{ answer: "No comparison data found for these platforms." }] });
        }
        return res.json({ answers: [{ answer: "Please specify exactly two CDPs to compare." }] });
    }

    // Handle Standard How-To Queries
    const results = searchQA(platform, question);
    console.log("Results:", results);
    return res.json({ answers: results });
});

// Start Server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
