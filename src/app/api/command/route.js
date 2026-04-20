import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Instantiate SDK if Key is available
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Command text is required.' }, { status: 400 });
    }

    if (!ai) {
      // Mock fallback
      return NextResponse.json({
        action: "BROADCAST",
        target: "General",
        message: "MOCK: Gemini Key missing. Please provide GEMINI_API_KEY for intelligent Q&A."
      }, { status: 200 });
    }

    // Prepare context-rich system instructions
    const stadiumInfo = context?.stadiumInfo || {};
    const liveData = context?.data || {};

    const systemPrompt = `You are the AI Command Center for ${stadiumInfo.name || 'a stadium'}.
    You have access to the following live metadata and layout:
    - Current Match: ${stadiumInfo.match || 'Unknown'}
    - Zones & Live Data (Wait Times & Density): ${JSON.stringify(liveData)}
    
    Current Zones allowed: ["Pavilion End", "North Stand", "South Pavilion", "VIP Enclosure", "East Gate", "West Gate", "Food Court A", "Restroom Block 1"]

    Task: Parse the user's natural language into a JSON object.
    Supported Actions:
    1. "REROUTE": For traffic management at Gates.
    2. "DISPATCH": To send staff/security to a specific target zone.
    3. "QUERY": For purely informational/procedural questions (e.g., "closest food", "longest wait", "who is playing").
    4. "BROADCAST": For general announcements.

    Instructions for Proximity:
    - If asked for "closest" something, use your logic to compare the known zones.
    - If asked about wait times, reference the live data provided above.

    Response JSON Structure:
    {
      "action": "QUERY" | "REROUTE" | "DISPATCH" | "BROADCAST",
      "target": "Zone Name" (if applicable),
      "message": "Human-friendly response or confirmation"
    }

    Respond ONLY with valid JSON. Do not use markdown.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });

    const outputText = response.text;
    const jsonOutput = JSON.parse(outputText);

    return NextResponse.json(jsonOutput, { status: 200 });

  } catch (error) {
    console.error('Command API Error:', error);
    return NextResponse.json({ error: 'Failed to process command' }, { status: 500 });
  }
}
