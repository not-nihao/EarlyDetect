import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

const personalityPrompts = {
  analytical:
    "You are an analytical medical AI assistant. Provide data-driven, evidence-based recommendations with specific statistics and medical research references. Be precise and thorough in your explanations.",
  empathetic:
    "You are a warm and empathetic medical AI assistant. Show understanding and emotional support while providing medical guidance. Use encouraging language and acknowledge the user's feelings and concerns.",
  enthusiastic:
    "You are an enthusiastic and motivating medical AI assistant. Be energetic and encouraging while providing medical recommendations. Help users feel positive about taking care of their health.",
  professional:
    "You are a professional medical AI assistant. Maintain a formal, clinical tone while being thorough and medically accurate. Focus on medical terminology and comprehensive explanations.",
}

export async function POST(req: Request) {
  try {
    const { messages, personality, userData } = await req.json()

    // Use Gemini API key
    const geminiApiKey = "AIzaSyDTLFAqhVBBgeJb6rt-rycAQrtVDq1wrUg"

    if (!geminiApiKey) {
      // Fallback response when no API key is configured
      const fallbackResponse = generateFallbackResponse(userData, personality)

      return new Response(
        new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder()
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: fallbackResponse })}\n\n`))
            controller.close()
          },
        }),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        },
      )
    }

    const systemPrompt = `${personalityPrompts[personality as keyof typeof personalityPrompts]}

You are a cancer screening recommendation assistant. Based on the user's health data: ${JSON.stringify(userData)}, provide personalized cancer screening recommendations.

Key guidelines:
1. Recommend appropriate screenings based on age, gender, family history, and risk factors
2. Explain why each screening is recommended
3. Suggest timing and frequency
4. Mention nearby clinic options when asked
5. Always emphasize that this is educational and not a replacement for professional medical advice
6. Be supportive and encouraging about preventive care

Common screenings to consider:
- Mammogram (breast cancer screening)
- Pap smear (cervical cancer screening)
- Colonoscopy/FIT test (colorectal cancer screening)
- PSA test (prostate cancer screening)
- Low-dose CT scan (lung cancer screening for high-risk individuals)
- Skin cancer screening

You can also help book appointments when requested.`

    const result = streamText({
      model: google("gemini-1.5-pro", {
        apiKey: geminiApiKey,
      }),
      system: systemPrompt,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)

    // Fallback response for any errors
    const { userData, personality } = await req.json().catch(() => ({ userData: null, personality: "professional" }))
    const fallbackResponse = generateFallbackResponse(userData, personality)

    return new Response(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", text: fallbackResponse })}\n\n`))
          controller.close()
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    )
  }
}

function generateFallbackResponse(userData: any, personality: string): string {
  if (!userData) {
    return "I'd be happy to help you with cancer screening recommendations! However, I don't have access to your health information. Please complete the health assessment first so I can provide personalized recommendations."
  }

  const age = Number.parseInt(userData.age) || 25
  const gender = userData.gender || "not specified"
  const familyHistory = userData.familyHistory || []

  const recommendations = []

  // Age and gender-based recommendations
  if (gender === "female") {
    if (age >= 21) {
      recommendations.push("Pap smear for cervical cancer screening")
    }
    if (age >= 40 || familyHistory.includes("Breast Cancer")) {
      recommendations.push("mammogram for breast cancer screening")
    }
  }

  if (gender === "male" && age >= 50) {
    recommendations.push("PSA test for prostate cancer screening")
  }

  if (age >= 45) {
    recommendations.push("colonoscopy for colorectal cancer screening")
  }

  if (age >= 50 && userData.smokingStatus === "current") {
    recommendations.push("low-dose CT scan for lung cancer screening")
  }

  const primaryRecommendation = recommendations[0] || "general health screening"

  const personalityResponses = {
    analytical: `Based on your health data analysis - age ${age}, gender: ${gender}, and risk factors - I recommend you get a ${primaryRecommendation}. This recommendation follows evidence-based guidelines for your demographic profile.`,
    empathetic: `I understand that thinking about cancer screening can feel overwhelming, but I'm here to support you. Based on the information you've shared, I would gently recommend you consider getting a ${primaryRecommendation}. This is a proactive step for your health and wellbeing.`,
    enthusiastic: `Great news! Based on your health profile, I have some positive recommendations for you! I'd recommend you get a ${primaryRecommendation} - this is an excellent way to stay on top of your health and catch any issues early!`,
    professional: `Based on your clinical profile and risk assessment, I recommend you schedule a ${primaryRecommendation}. This screening is indicated based on current medical guidelines for individuals with your demographic and risk factors.`,
  }

  const response =
    personalityResponses[personality as keyof typeof personalityResponses] || personalityResponses.professional

  return `${response} Would you like me to help you book an appointment for that?

*Please note: This is for educational purposes and does not replace professional medical advice. Always consult with qualified healthcare providers for medical decisions.*`
}
