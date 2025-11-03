// Function uses the official Google GenAI SDK (Node.js/JavaScript)
import { GoogleGenAI } from "@google/genai";


// This is the standard entry point for Netlify Functions
export const handler = async (event) => {
    // 1. Check if the request is a POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }


    // 2. Safely parse the JSON body sent from your chat widget
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON format" }) };
    }
    
    const userPrompt = requestBody.prompt;


    // 3. Initialize the client securely
    // It automatically reads the GEMINI_API_KEY from Netlify's environment variables
    // Use gemini-1.0-pro as it's highly stable.
    const ai = new GoogleGenAI({}); 


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
        });


        // 4. Return the AI's response
        return {
            statusCode: 200,
            body: JSON.stringify({ response: response.text }),
            headers: {
                // Allows your external website to call this function
                'Access-Control-Allow-Origin': '*', 
            }
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Serverless API Error: ${error.message}` }),
        };
    }
};
