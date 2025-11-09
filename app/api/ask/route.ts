import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question cannot be empty" },
        { status: 400 }
      );
    }

    const answer = await generateAnswer(question.trim());
    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error in ask API route:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to generate answer";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        id: generateId(),
        title: "Error",
        sections: {
          "Error": errorMessage
        }
      },
      { status: 500 }
    );
  }
}
