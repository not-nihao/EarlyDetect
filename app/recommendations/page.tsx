"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, ExternalLink, Heart, Shield, Users } from "lucide-react"
import Link from "next/link"

interface BookingData {
  clinic: string
  screeningType: string
  date: string
  time: string
}

const healthArticles = [
  {
    id: 1,
    title: "Understanding Mammogram Results: What You Need to Know",
    category: "Breast Health",
    readTime: "5 min read",
    summary: "Learn how to interpret your mammogram results and what different findings mean for your health.",
    relevance: "breast",
  },
  {
    id: 2,
    title: "Colorectal Cancer Prevention: Diet and Lifestyle Tips",
    category: "Digestive Health",
    readTime: "7 min read",
    summary:
      "Discover evidence-based strategies to reduce your risk of colorectal cancer through nutrition and lifestyle changes.",
    relevance: "colorectal",
  },
  {
    id: 3,
    title: "The Importance of Regular Health Screenings",
    category: "Preventive Care",
    readTime: "4 min read",
    summary: "Why regular health screenings are crucial for early detection and better health outcomes.",
    relevance: "general",
  },
  {
    id: 4,
    title: "Managing Anxiety Before Medical Screenings",
    category: "Mental Health",
    readTime: "6 min read",
    summary: "Practical tips to reduce anxiety and stress before your medical appointments and screenings.",
    relevance: "general",
  },
  {
    id: 5,
    title: "Cervical Cancer Prevention and HPV Vaccination",
    category: "Women's Health",
    readTime: "8 min read",
    summary: "Everything you need to know about cervical cancer prevention, including the role of HPV vaccination.",
    relevance: "cervical",
  },
]

const nextSteps = [
  {
    icon: Calendar,
    title: "Prepare for Your Screening",
    description: "Follow pre-screening instructions and prepare any questions for your healthcare provider.",
  },
  {
    icon: Heart,
    title: "Maintain Healthy Habits",
    description: "Continue with regular exercise, balanced diet, and stress management techniques.",
  },
  {
    icon: Users,
    title: "Share with Family",
    description: "Discuss your screening results with family members who may benefit from similar screenings.",
  },
  {
    icon: Shield,
    title: "Schedule Follow-ups",
    description: "Set reminders for your next recommended screening appointments.",
  },
]

export default function RecommendationsPage() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const storedBooking = localStorage.getItem("bookingData")
    const storedUserData = localStorage.getItem("questionnaireData")

    if (storedBooking) setBookingData(JSON.parse(storedBooking))
    if (storedUserData) setUserData(JSON.parse(storedUserData))
  }, [])

  const getRelevantArticles = () => {
    if (!bookingData) return healthArticles.slice(0, 3)

    const screeningType = bookingData.screeningType.toLowerCase()
    const relevant = healthArticles.filter(
      (article) =>
        article.relevance === "general" ||
        screeningType.includes(article.relevance) ||
        (screeningType.includes("mammogram") && article.relevance === "breast") ||
        (screeningType.includes("pap") && article.relevance === "cervical") ||
        (screeningType.includes("colonoscopy") && article.relevance === "colorectal"),
    )

    return relevant.slice(0, 4)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Your Health Journey</h1>
        <p className="text-gray-600">Personalized recommendations and next steps</p>
      </div>

      {bookingData && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Appointment Confirmed</span>
            </div>
            <div className="text-sm text-green-700">
              <p>
                <strong>{bookingData.screeningType}</strong>
              </p>
              <p>
                {bookingData.date} at {bookingData.time}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Next Steps</CardTitle>
          <CardDescription>Recommended actions for your health journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextSteps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recommended Reading</CardTitle>
          <CardDescription>Articles tailored to your health profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRelevantArticles().map((article) => (
              <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{article.readTime}</span>
                </div>
                <h4 className="font-semibold text-sm mb-2">{article.title}</h4>
                <p className="text-xs text-gray-600 mb-3">{article.summary}</p>
                <Button size="sm" variant="outline" className="text-xs bg-transparent">
                  Read Article
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Link href="/chat" className="w-full">
          <Button variant="outline" className="w-full bg-transparent">
            Continue Chat with AI Assistant
          </Button>
        </Link>
        <Link href="/" className="w-full">
          <Button className="w-full">Start New Assessment</Button>
        </Link>
      </div>
    </div>
  )
}
