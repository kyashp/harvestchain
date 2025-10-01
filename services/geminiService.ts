import { CreditScoreData } from '../types';
import OpenAI from 'openai';

const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: (import.meta as any).env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only use this in a secure environment
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  },
});

export const getFishPriceRecommendation = async (fishType: string, season: string, location: string): Promise<string> => {
  try {
    const prompt = `Act as a fish market expert in the Philippines. Provide a recommended price per kilogram (in PHP) for fresh, high-quality "${fishType}". Current context: the season is ${season} and the fish are from the ${location} region. Give a specific price range and a short, one-sentence justification for it.`;

    const response = await ai.chat.completions.create({
        model: 'qwen/qwen3-coder:free',
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    });
    const message = response.choices[0].message.content.trim();
    
    return message;
  } catch (error) {
    console.error("Error getting fish price recommendation:", error);
    return "Could not retrieve price recommendation at this time. Please try again later.";
  }
};

export const getCreditScore = async (fishermanData: any): Promise<CreditScoreData> => {
    try {
        const prompt = `
            Act as an AI credit scoring model for a financial inclusion app for Filipino fisherfolk.
            Based on the following JSON data, calculate a credit score between 300 and 850.
            Your response MUST be a valid JSON object with only a "score" field.
            Crucially, a high number of 'declinedContracts' is a major red flag and should heavily penalize the score, as it signifies unreliability.

            Fisherman Data:
            ${JSON.stringify(fishermanData, null, 2)}
        `;

        const response = {text: `{"score": ${Math.floor(Math.random() * (850 - 300 + 1)) + 300}}`}; // Mock response for demonstration
        const jsonText = response.text;
        const data = JSON.parse(jsonText);
        // Return mock factors and history since UI expects them, but they are not displayed
        return {
            score: data.score,
            factors: {
                positive: ["Score calculated successfully."],
                negative: ["No issues detected."],
            },
            history: [
                { month: "Jan", score: data.score },
                { month: "Feb", score: data.score },
                { month: "Mar", score: data.score },
            ],
        };
    } catch (error) {
        console.error("Error getting credit score:", error);
        // Return a mock error response that fits the type
        return {
            score: 404,
            factors: {
                positive: ["Could not calculate score."],
                negative: ["An API error occurred."],
            },
            history: [
                { month: "Jan", score: 500 },
                { month: "Feb", score: 500 },
                { month: "Mar", score: 500 },
            ],
        };
    }
};
