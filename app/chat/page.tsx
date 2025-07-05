"use client"

import { useChat } from "@ai-sdk/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Calendar, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [personality, setPersonality] = useState("")

  useEffect(() => {
    const storedData = localStorage.getItem("questionnaireData")
    const storedPersonality = localStorage.getItem("selectedPersonality")

    if (storedData) setUserData(JSON.parse(storedData))
    if (storedPersonality) setPersonality(storedPersonality)
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      personality,
      userData,
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `Hello! I'm your personalized cancer screening assistant. Based on your health information, I'm here to provide tailored recommendations for cancer screenings that might be right for you. 

I can help you understand:
• Which screenings are recommended for your age and risk profile
• When and how often you should get screened
• What to expect during different screening procedures
• How to book appointments at nearby clinics

What would you like to know about cancer screening?`,
      },
    ],
  })

  const handleBookAppointment = () => {
    router.push("/booking")
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-md h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Your AI Health Assistant</h1>
        <p className="text-sm text-gray-600 capitalize">{personality} personality</p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return <span key={i}>{part.text}</span>
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex space-x-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBookAppointment}
              className="flex items-center bg-transparent"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Book Appointment
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/recommendations")}
              className="flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Find Clinics
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about cancer screening..."
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
