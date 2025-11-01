import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, numQuestions } = await request.json();

    if (!topic || !difficulty || !numQuestions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Generate ${numQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Format your response as a JSON array where each question has this exact structure:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0 (index of correct option, 0-3)
}

Make sure:
- Questions are clear and well-formulated
- All 4 options are plausible
- Only one option is correct
- Questions vary in style and content
- Difficulty matches the "${difficulty}" level

Return ONLY the JSON array, no additional text or markdown formatting.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-live" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No content received from Gemini");
    }

    // Parse the JSON response
    let questions;
    try {
      // Try to parse directly first
      questions = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the response
      // Remove markdown code blocks if present
      let cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Validate the questions format
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

