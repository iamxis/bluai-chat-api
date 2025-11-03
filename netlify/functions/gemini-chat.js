// netlify/functions/gemini-chat.js (Final, robust CORS handling)
const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
    // 🛑 1. HANDLE OPTIONS (CORS PRE-FLIGHT) FIRST 🛑
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                // Must explicitly allow the methods and headers used by the POST request
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: '' // No content needed for a pre-flight success
        };
    }
    
    // 2. Only proceed if it is a POST request
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // --- Start POST Request Logic ---
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON format" }) };
    }
    
    const userPrompt = requestBody.prompt;

    // Initialize the client securely
    const ai = new GoogleGenAI({}); 

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: userPrompt,
        });

        // 3. Return the AI's response (with CORS header for the main request)
        return {
            statusCode: 200,
            body: JSON.stringify({ response: response.text }),
            headers: {
                // Allows your external website to call the function
                'Access-Control-Allow-Origin': '*', 
            }
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Return a 403 or 400 error status if the API key is wrong or the request body is bad
        const status = (error.message.includes('API key') || error.message.includes('permission')) ? 403 : 500;
        
        return {
            statusCode: status,
            body: JSON.stringify({ error: `AI Service Error (Code ${status}): ${error.message}` }),
        };
    }
};
