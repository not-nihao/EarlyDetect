"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Bot, ArrowRight, Mic, MicOff, Volume2, VolumeX, Pause } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useVoiceChat } from "@/hooks/use-voice-chat"

interface ConversationData {
  demographics: {
    age?: number
    gender?: string
    race?: string
    location?: string
  }
  medical: {
    chronicConditions?: string[]
    medications?: string[]
    previousScreenings?: string[]
    familyHistory?: string[]
    allergies?: string[]
  }
  lifestyle: {
    smokingStatus?: string
    alcoholConsumption?: string
    physicalActivity?: string
    diet?: string
    stress?: string
    sleep?: string
  }
  concerns: {
    symptoms?: string[]
    worries?: string[]
    goals?: string[]
  }
  completeness: number
}

export default function ConversationPage() {
  const router = useRouter()
  const [conversationData, setConversationData] = useState<ConversationData>({
    demographics: {},
    medical: {},
    lifestyle: {},
    concerns: {},
    completeness: 0,
  })
  const [isComplete, setIsComplete] = useState(false)
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    isListening,
    isRecording,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeech,
    error: speechError,
  } = useVoiceChat()

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/conversation",
    body: {
      conversationData,
    },
    onFinish: (message) => {
      // Extract structured data from AI response
      try {
        const dataMatch = message.content.match(/\[DATA_UPDATE\](.*?)\[\/DATA_UPDATE\]/s)
        if (dataMatch) {
          const updatedData = JSON.parse(dataMatch[1])
          setConversationData(updatedData)

          // Check if conversation is complete
          if (updatedData.completeness >= 80) {
            setIsComplete(true)
          }
        }
      } catch (error) {
        console.error("Error parsing conversation data:", error)
      }

      // Auto-play AI response if voice mode is enabled
      if (inputMode === "voice") {
        speakText(message.content.replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "").trim())
      }
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `Hello! I'm your personal health assistant, and I'm here to help you understand what cancer screenings might be right for you. 

Instead of filling out a long form, let's just have a natural conversation. I'll ask you some questions along the way, but feel free to share anything that's on your mind about your health.

To get started, could you tell me a bit about yourself? Maybe your age and what brings you here today?`,
      },
    ],
  })

  // Text-to-Speech functionality
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

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

  const handleContinue = () => {
    // Store conversation data and move to personality selection
    localStorage.setItem("conversationData", JSON.stringify(conversationData))
    router.push("/personality")
  }

  const getDataCategories = () => {
    const categories = []

    if (Object.keys(conversationData.demographics).length > 0) {
      categories.push({ name: "Demographics", count: Object.keys(conversationData.demographics).length })
    }
    if (Object.keys(conversationData.medical).length > 0) {
      categories.push({ name: "Medical History", count: Object.keys(conversationData.medical).length })
    }
    if (Object.keys(conversationData.lifestyle).length > 0) {
      categories.push({ name: "Lifestyle", count: Object.keys(conversationData.lifestyle).length })
    }
    if (Object.keys(conversationData.concerns).length > 0) {
      categories.push({ name: "Health Concerns", count: Object.keys(conversationData.concerns).length })
    }

    return categories
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      // Load voices
      window.speechSynthesis.getVoices()

      // Some browsers need this event to load voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl h-screen flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Health Conversation</h1>
          <div className="flex items-center space-x-2">
            {/* Voice Controls */}
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

        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-gray-600">Conversation Progress:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${conversationData.completeness}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{conversationData.completeness}%</span>
        </div>

        {/* Voice Status Indicators */}
        {inputMode === "voice" && (
          <div className="flex items-center space-x-2 mb-2">
            {isListening && (
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

        {getDataCategories().length > 0 && (
          <div className="flex flex-wrap gap-2">
            {getDataCategories().map((category, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex gap-6">
        {/* Chat Interface */}
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
                    <AvatarFallback>
                      {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 relative ${
                      message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {/* Filter out data update tags from display */}
                      {message.content.replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "").trim()}
                    </div>

                    {/* Voice playback button for AI messages */}
                    {message.role === "assistant" && speechEnabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-70 hover:opacity-100"
                        onClick={() =>
                          speakText(message.content.replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "").trim())
                        }
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
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
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
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t">
            {inputMode === "text" ? (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your response..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
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

        {/* Data Summary Sidebar */}
        <Card className="w-80">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Information Gathered</h3>

            {Object.keys(conversationData.demographics).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Demographics</h4>
                <div className="space-y-1 text-sm">
                  {conversationData.demographics.age && <div>Age: {conversationData.demographics.age}</div>}
                  {conversationData.demographics.gender && <div>Gender: {conversationData.demographics.gender}</div>}
                  {conversationData.demographics.race && <div>Race: {conversationData.demographics.race}</div>}
                  {conversationData.demographics.location && (
                    <div>Location: {conversationData.demographics.location}</div>
                  )}
                </div>
              </div>
            )}

            {Object.keys(conversationData.medical).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Medical History</h4>
                <div className="space-y-1 text-sm">
                  {conversationData.medical.familyHistory && conversationData.medical.familyHistory.length > 0 && (
                    <div>Family History: {conversationData.medical.familyHistory.join(", ")}</div>
                  )}
                  {conversationData.medical.chronicConditions &&
                    conversationData.medical.chronicConditions.length > 0 && (
                      <div>Conditions: {conversationData.medical.chronicConditions.join(", ")}</div>
                    )}
                  {conversationData.medical.previousScreenings &&
                    conversationData.medical.previousScreenings.length > 0 && (
                      <div>Previous Screenings: {conversationData.medical.previousScreenings.join(", ")}</div>
                    )}
                </div>
              </div>
            )}

            {Object.keys(conversationData.lifestyle).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lifestyle</h4>
                <div className="space-y-1 text-sm">
                  {conversationData.lifestyle.smokingStatus && (
                    <div>Smoking: {conversationData.lifestyle.smokingStatus}</div>
                  )}
                  {conversationData.lifestyle.physicalActivity && (
                    <div>Exercise: {conversationData.lifestyle.physicalActivity}</div>
                  )}
                  {conversationData.lifestyle.diet && <div>Diet: {conversationData.lifestyle.diet}</div>}
                </div>
              </div>
            )}

            {Object.keys(conversationData.concerns).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Health Concerns</h4>
                <div className="space-y-1 text-sm">
                  {conversationData.concerns.symptoms && conversationData.concerns.symptoms.length > 0 && (
                    <div>Symptoms: {conversationData.concerns.symptoms.join(", ")}</div>
                  )}
                  {conversationData.concerns.worries && conversationData.concerns.worries.length > 0 && (
                    <div>Concerns: {conversationData.concerns.worries.join(", ")}</div>
                  )}
                </div>
              </div>
            )}

            {isComplete && (
              <div className="mt-6 pt-4 border-t">
                <div className="text-center">
                  <div className="text-green-600 font-medium mb-2">✓ Conversation Complete</div>
                  <Button onClick={handleContinue} className="w-full">
                    Continue to AI Assistant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
