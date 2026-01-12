
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the API key exclusively from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyTip = async (subjects: string[]) => {
  try {
    const subjectsList = subjects.length > 0 ? subjects.join(", ") : "general subjects";
    // Call generateContent with both model and contents directly.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `針對以下科目提供一條簡短、專業且具激勵性的考試叮嚀或學習技巧（50字以內）：${subjectsList}。請使用繁體中文。`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });
    // Access the .text property directly instead of calling a method.
    return response.text?.trim() || "祝各位考生考試順利，全力以赴！";
  } catch (error) {
    console.error("Error generating tip:", error);
    return "保持平常心，專注每一題。祝考試順利！";
  }
};
