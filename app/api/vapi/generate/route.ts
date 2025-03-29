import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    let { type, role, level, techstack, amount, userid } = await request.json();

    // Clean up the template variables that VAPI sends
    role = role?.replace(/[{}]/g, "").trim();
    type = type?.replace(/[{}]/g, "").trim();
    level = level?.replace(/[{}]/g, "").trim();
    techstack = techstack?.replace(/[{}]/g, "").trim();
    amount = amount?.replace(/[{}]/g, "").trim();
    userid = userid?.replace(/[{}]/g, "").trim();

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      console.error("Missing fields:", {
        type,
        role,
        level,
        techstack,
        amount,
        userid,
      });
      return Response.json(
        {
          success: false,
          message: "Missing required fields",
          data: { type, role, level, techstack, amount, userid },
        },
        { status: 400 }
      );
    }

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    // Validate questions format
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Questions must be an array");
      }
    } catch (error) {
      console.error("Error parsing questions:", error);
      return Response.json(
        {
          success: false,
          message: "Invalid questions format",
        },
        { status: 500 }
      );
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid, // Make sure this matches the field name in your Firestore schema
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection("interviews").add(interview);

    if (!result) {
      return Response.json(
        {
          success: false,
          message: "Failed to save interview",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        interviewId: result.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/vapi/generate:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
