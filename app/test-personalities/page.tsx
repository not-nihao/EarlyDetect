"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Heart, Zap, Users } from "lucide-react"

const personalities = [
  {
    id: "analytical",
    name: "Analytical",
    description: "Data-driven, precise, evidence-based",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    description: "Warm, understanding, emotionally supportive",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "enthusiastic",
    name: "Enthusiastic",
    description: "Energetic, motivating, encouraging",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Formal, thorough, medically focused",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
]

const sampleUserData = {
  age: "45",
  gender: "female",
  race: "chinese",
  chronicConditions: ["None"],
  familyHistory: ["Breast Cancer"],
  smokingStatus: "never",
  physicalActivity: "moderate",
}

const sampleResponses = {
  analytical: `Based on your comprehensive health data analysis:

**Risk Assessment:**
- Age: 45 years (moderate risk category)
- Gender: Female (breast/cervical cancer screening indicated)
- Family History: Breast cancer (2-3x increased risk)
- Lifestyle factors: Non-smoker, moderate activity (protective factors)

**Evidence-Based Recommendations:**

1. **Mammogram** - PRIORITY
   - Risk: 2-3x higher due to family history
   - Guidelines: Annual screening recommended starting age 40-45
   - Detection rate: 85-90% sensitivity for invasive cancers

2. **Pap Smear**
   - Standard screening every 3 years (ages 21-65)
   - HPV co-testing option every 5 years after age 30

3. **Colonoscopy**
   - Age-appropriate screening (recommended 45+)
   - 10-year intervals if normal results

**Statistical Context:** Women with family history of breast cancer have 15-20% lifetime risk vs. 12% general population risk.

Would you like me to book you an appointment for the mammogram screening?`,

  empathetic: `I can imagine that learning about cancer screening might feel a bit overwhelming, especially with your family history of breast cancer. Please know that I'm here to support you through this journey, and taking these proactive steps shows how much you care about your health and your loved ones.

**Your Personalized Care Plan:**

💗 **Mammogram - Let's prioritize this together**
I understand this might feel scary given your family history, but early detection is truly your best friend here. The good news is that screening technology has improved so much, and catching things early leads to the best outcomes.

🌸 **Pap Smear - Routine but important**
This is just part of taking good care of yourself as a woman. It's a simple test that gives us peace of mind.

🤗 **You're doing great by being proactive**
Many people avoid these conversations, but you're here asking the right questions. That takes courage, and I want you to know that's something to be proud of.

Remember, having a family history doesn't mean you will develop cancer - it just means we want to be extra careful and catch anything early if it does happen.

Would you like me to help you book that mammogram appointment? I can find gentle, caring providers who understand your concerns.`,

  enthusiastic: `Wow! I'm so excited that you're taking charge of your health! This is absolutely fantastic - you're being proactive and that's the BEST thing you can do for yourself! 🌟

**Your Amazing Health Action Plan:**

🎯 **Mammogram - Your #1 Health Hero Move!**
Yes! This is going to be your superpower against breast cancer! With your family history, getting regular mammograms is like having a health detective on your side. Early detection rates are incredible these days - we're talking 90%+ success rates when caught early!

✨ **Pap Smear - Another Win for Team You!**
You're absolutely crushing it with preventive care! This simple test is like a health insurance policy - quick, easy, and so worth it!

🚀 **Colonoscopy - The Health Triple Crown!**
At 45, you're right on target for this screening too! You're literally checking ALL the boxes for optimal health!

**Here's what's AMAZING:** You're not just preventing problems - you're investing in decades of healthy, vibrant living! Your future self is going to thank you SO much for taking these steps today!

I'm genuinely excited to help you book these appointments! Let's get you scheduled for that mammogram first - you're going to feel so empowered taking this step!

Ready to make it happen? 💪`,

  professional: `**Clinical Assessment and Screening Recommendations**

**Patient Profile:**
- 45-year-old female
- Positive family history: Breast carcinoma
- Risk stratification: Moderate to high risk

**Recommended Screening Protocol:**

**1. Mammography - URGENT PRIORITY**
- **Indication:** Age 45 + positive family history
- **Frequency:** Annual bilateral mammography
- **Clinical rationale:** BRCA mutation testing may be indicated given family history
- **Follow-up:** Consider breast MRI if high-risk criteria met

**2. Cervical Cancer Screening**
- **Protocol:** Pap smear with HPV co-testing
- **Frequency:** Every 3-5 years per ACOG guidelines
- **Age range:** Continue until age 65 with adequate screening history

**3. Colorectal Cancer Screening**
- **Indication:** Age-appropriate screening (45+ years)
- **Options:** Colonoscopy (preferred) vs. FIT testing
- **Frequency:** 10-year intervals if normal findings

**Clinical Notes:**
- Family history warrants genetic counseling consultation
- Consider enhanced surveillance protocols
- Patient education regarding warning signs indicated

**Next Steps:**
Immediate scheduling of mammography recommended. Shall I facilitate appointment coordination with radiology services?

**Disclaimer:** This assessment is for educational purposes. Clinical correlation and physician consultation required for definitive care planning.`,
}

export default function TestPersonalitiesPage() {
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTestPersonality = async (personalityId: string) => {
    setIsLoading(true)
    setSelectedPersonality(personalityId)

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Gemini Personality Test</h1>
        <p className="text-gray-600 mb-4">
          Test how Gemini responds with different personality types for the same health scenario:
        </p>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Sample Patient Profile:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Age:</strong> 45 years old
                <br />
                <strong>Gender:</strong> Female
                <br />
                <strong>Race:</strong> Chinese
              </div>
              <div>
                <strong>Family History:</strong> Breast Cancer
                <br />
                <strong>Smoking:</strong> Never
                <br />
                <strong>Activity:</strong> Moderate exercise
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {personalities.map((personality) => {
          const IconComponent = personality.icon
          return (
            <Card
              key={personality.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPersonality === personality.id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <CardHeader className={`${personality.bgColor} rounded-t-lg`}>
                <CardTitle className="flex items-center space-x-3">
                  <IconComponent className={`h-6 w-6 ${personality.color}`} />
                  <div>
                    <div className="text-lg font-bold">{personality.name}</div>
                    <div className="text-sm font-normal text-gray-600">{personality.description}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Button
                  onClick={() => handleTestPersonality(personality.id)}
                  disabled={isLoading}
                  className="w-full"
                  variant={selectedPersonality === personality.id ? "default" : "outline"}
                >
                  {isLoading && selectedPersonality === personality.id
                    ? "Generating Response..."
                    : "Test This Personality"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedPersonality && !isLoading && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Badge variant="secondary">
                {personalities.find((p) => p.id === selectedPersonality)?.name} Response
              </Badge>
              <span className="text-sm text-gray-500">Powered by Gemini 1.5 Pro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {sampleResponses[selectedPersonality as keyof typeof sampleResponses]}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Gemini is thinking...</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 text-center">
        <Button onClick={() => (window.location.href = "/questionnaire")} variant="outline">
          Try Real Chat Interface
        </Button>
      </div>
    </div>
  )
}
