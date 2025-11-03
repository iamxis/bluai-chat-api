// netlify/functions/gemini-chat.js (Final Secure Version)

exports.handler = async (event) => {
    // 1. Dynamic Import
    const { GoogleGenAI } = await import("@google/genai"); 
    
    // 2. Initialize the client securely using Netlify's environment variable
    // This relies on your GOOGLE_API_KEY or GEMINI_API_KEY being set in Netlify's UI.
    const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY 
    });
    
    // 3. HANDLE OPTIONS (CORS Pre-Flight Check)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: ''
        };
    }
    
    // 4. Handle non-POST methods
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 5. Parse Request Body
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON format" }) };
    }
    
    const userPrompt = requestBody.prompt;

    // 6. API Call Logic
    try { 
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: userPrompt,
        });

        // SUCCESS RESPONSE
        return {
            statusCode: 200,
            body: JSON.stringify({ response: response.text }),
            headers: {
                'Access-Control-Allow-Origin': '*', 
            }
        };
    } catch (error) {
        // ERROR RESPONSE
        console.error("Gemini API Error:", error);
        
        // Return a 403 status if the error is explicitly an API key/permission issue
        const status = (error.message && (error.message.includes('API key') || error.message.includes('permission'))) ? 403 : 500;
        
        return {
            statusCode: status,
            body: JSON.stringify({ error: `AI Service Error (Code ${status}): ${error.message}` }),
        };
    }
};
