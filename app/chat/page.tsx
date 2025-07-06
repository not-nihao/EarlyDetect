"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Calendar, MapPin, Mic, MicOff, Volume2, VolumeX, Pause } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useVoiceChat } from "@/hooks/use-voice-chat"

export default function ChatPage() {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [personality, setPersonality] = useState("")
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeech,
    error: speechError,
  } = useVoiceChat()

  useEffect(() => {
    // Try to get conversation data first, then fall back to questionnaire data
    const conversationData = localStorage.getItem("conversationData")
    const questionnaireData = localStorage.getItem("questionnaireData")
    const storedPersonality = localStorage.getItem("selectedPersonality")

    if (conversationData) {
      // Convert conversation data to format expected by chat API
      const convData = JSON.parse(conversationData)
      const formattedData = {
        age: convData.demographics?.age?.toString() || "",
        gender: convData.demographics?.gender || "",
        race: convData.demographics?.race || "",
        chronicConditions: convData.medical?.chronicConditions || [],
        familyHistory: convData.medical?.familyHistory || [],
        smokingStatus: convData.lifestyle?.smokingStatus || "",
        physicalActivity: convData.lifestyle?.physicalActivity || "",
        concerns: convData.concerns?.worries?.join(", ") || "",
        // Add any additional fields from conversation
        medications: convData.medical?.medications || [],
        previousScreenings: convData.medical?.previousScreenings || [],
        symptoms: convData.concerns?.symptoms || [],
      }
      setUserData(formattedData)
    } else if (questionnaireData) {
      setUserData(JSON.parse(questionnaireData))
    }

    if (storedPersonality) setPersonality(storedPersonality)
  }, [])

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      personality,
      userData,
    },
    onFinish: (message) => {
      // Auto-play AI response if voice mode is enabled
      if (speechEnabled) {
        speakText(message.content)
      }
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `Hello! I'm your personalized cancer screening assistant. I've reviewed the health information you shared during our conversation, and I'm here to provide tailored recommendations for cancer screenings that might be right for you.

Based on what you've told me, I can help you understand:
• Which screenings are recommended for your age and risk profile
• When and how often you should get screened
• What to expect during different screening procedures
• How to book appointments at nearby clinics

What would you like to know about cancer screening?`,
      },
    ],
  })

  // Text-to-Speech functionality
  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use a more natural voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.name.includes("Samantha") ||
          voice.name.includes("Karen"),
      ) ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechSynthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      setSpeechEnabled(!speechEnabled)
    }
  }

  // Handle voice input
  useEffect(() => {
    if (transcript && inputMode === "voice") {
      setInput(transcript)
    }
  }, [transcript, inputMode, setInput])

  const handleVoiceSubmit = () => {
    if (transcript.trim()) {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent
      handleSubmit(syntheticEvent)
      resetTranscript()
    }
  }

  const toggleInputMode = () => {
    if (inputMode === "voice") {
      stopListening()
      setInputMode("text")
    } else {
      setInputMode("voice")
      if (browserSupportsSpeech) {
        startListening()
      }
    }
  }

  const handleBookAppointment = () => {
    router.push("/booking")
  }

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-4 max-w-md h-screen flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Your AI Health Assistant</h1>
            <p className="text-sm text-gray-600 capitalize">{personality} personality</p>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSpeech}
              className={`${speechEnabled ? "bg-green-50 border-green-200" : ""}`}
            >
              {isSpeaking ? (
                <Pause className="h-4 w-4" />
              ) : speechEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleInputMode}
              className={`${inputMode === "voice" ? "bg-blue-50 border-blue-200" : ""}`}
              disabled={!browserSupportsSpeech}
            >
              {inputMode === "voice" ? (
                isListening ? (
                  <Mic className="h-4 w-4 text-red-500" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Voice Status Indicators */}
        {(inputMode === "voice" || speechEnabled) && (
          <div className="flex items-center space-x-2 mt-2">
            {inputMode === "voice" && isListening && (
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                🎤 Listening...
              </Badge>
            )}
            {speechEnabled && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                🔊 Voice responses enabled
              </Badge>
            )}
            {speechError && (
              <Badge variant="destructive" className="text-xs">
                Voice error: {speechError}
              </Badge>
            )}
          </div>
        )}
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
                  className={`rounded-lg p-3 relative ${
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

                  {/* Voice playback button for AI messages */}
                  {message.role === "assistant" && speechEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      onClick={() => speakText(message.content)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
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

          {inputMode === "text" ? (
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
          ) : (
            <div className="space-y-3">
              {/* Voice Input Display */}
              <div className="min-h-[40px] p-3 border rounded-md bg-gray-50">
                {transcript ? (
                  <span className="text-sm">{transcript}</span>
                ) : (
                  <span className="text-sm text-gray-500">
                    {isListening ? "Listening... speak now" : "Click the microphone to start speaking"}
                  </span>
                )}
              </div>

              {/* Voice Controls */}
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "default"}
                  onClick={isListening ? stopListening : startListening}
                  disabled={!browserSupportsSpeech}
                  className="flex-1"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Speaking
                    </>
                  )}
                </Button>

                <Button type="button" onClick={handleVoiceSubmit} disabled={!transcript.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>

                <Button type="button" variant="outline" onClick={resetTranscript} disabled={!transcript}>
                  Clear
                </Button>
              </div>

              {!browserSupportsSpeech && (
                <p className="text-xs text-red-500 text-center">
                  Voice input is not supported in your browser. Please use text input.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
