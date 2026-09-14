import { Router, type IRouter } from "express";
import { TranscribeSpeechBody } from "@workspace/api-zod";
import FormData from "form-data";

const router: IRouter = Router();

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";

router.post("/transcribe", async (req, res) => {
  const body = TranscribeSpeechBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { audio, expectedText } = body.data;

  let transcribedText = "";
  let accuracyScore   = 0;
  let feedbackText    = "Good effort! Keep practicing.";
  let suggestions: string[] = [
    "Try speaking more slowly",
    "Focus on each syllable"
  ];

  try {
    // ── Step 1: Convert base64 audio to buffer ──────────────────
    const audioBuffer = Buffer.from(audio, "base64");

    // ── Step 2: Send to our Python AI server for scoring ────────
    const formData = new FormData();
    formData.append("audio", audioBuffer, {
      filename:    "audio.wav",
      contentType: "audio/wav",
    });
    formData.append("expected_text", expectedText || "");

    const scoreResponse = await fetch(`${AI_SERVER_URL}/score`, {
      method:  "POST",
      body:    formData,
      headers: formData.getHeaders(),
    });

    if (scoreResponse.ok) {
      const result = await scoreResponse.json() as {
        success:          boolean;
        transcription:    string;
        expected:         string;
        score:            number;
        feedback:         string;
        is_correct:       boolean;
        duration_seconds: number;
      };

      if (result.success) {
        transcribedText = result.transcription  || "";
        accuracyScore   = result.score          || 0;
        feedbackText    = result.feedback       || feedbackText;

        // Build suggestions based on score
        if (accuracyScore >= 90) {
          suggestions = [
            "Excellent pronunciation!",
            "Try the next exercise"
          ];
        } else if (accuracyScore >= 70) {
          suggestions = [
            "Good job! Practice this word a few more times",
            "Try speaking at a slightly faster pace"
          ];
        } else if (accuracyScore >= 50) {
          suggestions = [
            "Try breaking the word into syllables",
            "Listen to the example and repeat slowly"
          ];
        } else {
          suggestions = [
            "Take a deep breath and try again",
            "Speak slowly and clearly, one sound at a time"
          ];
        }
      }
    } else {
      console.error("AI server error:", scoreResponse.status);
      // Fallback — still return something useful
      transcribedText = "";
      accuracyScore   = 0;
    }

  } catch (err) {
    console.error("Error calling AI server:", err);
    // If AI server is down, return graceful fallback
    feedbackText = "Speech analysis unavailable. Please try again.";
    suggestions  = ["Make sure the AI server is running on port 8000"];
  }

  res.json({
    transcribedText,
    accuracyScore,
    feedbackText,
    suggestions,
  });
});

export default router;