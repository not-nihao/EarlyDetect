"use client"

import type React from "react"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Bot, ArrowRight, Mic, MicOff, Volume2, ChevronRight, ChevronUp, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useVoiceChat } from "@/hooks/use-voice-chat"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

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

interface QuestionContext {
  type: "text" | "multiple-choice" | "scale" | "buttons"
  options?: string[]
  range?: { min: number; max: number; step: number }
  current: number
  total: number
  category: string
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
  const [chatTone, setChatTone] = useState("friendly")
  const [chatDepth, setChatDepth] = useState("balanced")
  const [language, setLanguage] = useState("english")
  const [accessibility, setAccessibility] = useState("standard")
  const [infoGatheredOpen, setInfoGatheredOpen] = useState(false)
  const [questionContext, setQuestionContext] = useState<QuestionContext>({
    type: "text",
    current: 1,
    total: 10,
    category: "Getting Started",
  })
  const [scaleValue, setScaleValue] = useState([5])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  const {
    isListening,
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
      chatTone,
      chatDepth,
      language,
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

        // Extract question context
        const contextMatch = message.content.match(/\[QUESTION_CONTEXT\](.*?)\[\/QUESTION_CONTEXT\]/s)
        if (contextMatch) {
          const context = JSON.parse(contextMatch[1])
          setQuestionContext(context)
        }
      } catch (error) {
        console.error("Error parsing conversation data:", error)
      }

      // Show information gathered panel
      setInfoGatheredOpen(true)
      setTimeout(() => {
        if (!isMobile) {
          setInfoGatheredOpen(false)
        }
      }, 3000)

      // Auto-play AI response if voice mode is enabled
      if (inputMode === "voice") {
        speakText(
          message.content
            .replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "")
            .replace(/\[QUESTION_CONTEXT\].*?\[\/QUESTION_CONTEXT\]/s, "")
            .trim(),
        )
      }
    },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `Hello! I'm your personal health assistant, and I'm here to help you understand what cancer screenings might be right for you. 

Instead of filling out a long form, let's just have a natural conversation. I'll ask you some questions along the way, but feel free to share anything that's on your mind about your health.

To get started, could you tell me a bit about yourself? Maybe your age and what brings you here today?

[QUESTION_CONTEXT]{"type": "text", "current": 1, "total": 10, "category": "Getting Started"}[/QUESTION_CONTEXT]`,
      },
    ],
  })

  // Text-to-Speech functionality
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speakText = (text: string) => {
    if (!speechEnabled || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find((voice) => voice.name.includes("Google") || voice.name.includes("Microsoft")) ||
      voices.find((voice) => voice.lang.startsWith("en")) ||
      voices[0]

    if (preferredVoice) utterance.voice = preferredVoice

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

  // Handle voice input
  useEffect(() => {
    if (transcript && inputMode === "voice") {
      setInput(transcript)
    }
  }, [transcript, inputMode, setInput])

  const handleVoiceSubmit = () => {
    if (transcript.trim()) {
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
      handleSubmit(syntheticEvent)
      resetTranscript()
    }
  }

  const handleContinue = () => {
    localStorage.setItem("conversationData", JSON.stringify(conversationData))
    router.push("/personality")
  }

  const handleQuickResponse = (response: string) => {
    setInput(response)
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent
    handleSubmit(syntheticEvent)
  }

  const handleScaleSubmit = () => {
    handleQuickResponse(scaleValue[0].toString())
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Load voices when component mounts
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const renderQuestionInput = () => {
    if (questionContext.type === "multiple-choice" && questionContext.options) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {questionContext.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleQuickResponse(option)}
              className="h-auto p-3 text-left justify-start"
              disabled={isLoading}
            >
              {option}
            </Button>
          ))}
        </div>
      )
    }

    if (questionContext.type === "buttons" && questionContext.options) {
      return (
        <div className="flex flex-wrap gap-2 mb-4">
          {questionContext.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickResponse(option)}
              disabled={isLoading}
            >
              {option}
            </Button>
          ))}
        </div>
      )
    }

    if (questionContext.type === "scale" && questionContext.range) {
      return (
        <div className="mb-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Scale: {questionContext.range.min}</span>
            <span className="font-medium">{scaleValue[0]}</span>
            <span className="text-sm text-gray-600">{questionContext.range.max}</span>
          </div>
          <Slider
            value={scaleValue}
            onValueChange={setScaleValue}
            max={questionContext.range.max}
            min={questionContext.range.min}
            step={questionContext.range.step}
            className="mb-3"
          />
          <Button onClick={handleScaleSubmit} disabled={isLoading} className="w-full">
            Submit Rating
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold">Health Conversation</h1>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionContext.current / questionContext.total) * 100}%` }}
              />
              <div className="absolute -top-6 left-0 text-xs text-gray-500">Previous</div>
              <div
                className="absolute -top-6 text-xs font-medium text-blue-600"
                style={{
                  left: `${(questionContext.current / questionContext.total) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                {questionContext.category}
              </div>
              <div className="absolute -top-6 right-0 text-xs text-gray-500">Next</div>
            </div>
            <span className="text-sm font-medium whitespace-nowrap">
              {questionContext.current}/{questionContext.total}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Personalization Panel - Desktop Only */}
          {!isMobile && (
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 text-sm">Personalization</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Chat Tone</label>
                      <Tabs value={chatTone} onValueChange={setChatTone}>
                        <TabsList className="grid w-full grid-cols-1 h-auto">
                          <TabsTrigger value="friendly" className="text-xs">
                            Friendly
                          </TabsTrigger>
                          <TabsTrigger value="professional" className="text-xs">
                            Professional
                          </TabsTrigger>
                          <TabsTrigger value="casual" className="text-xs">
                            Casual
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Depth</label>
                      <Tabs value={chatDepth} onValueChange={setChatDepth}>
                        <TabsList className="grid w-full grid-cols-1 h-auto">
                          <TabsTrigger value="brief" className="text-xs">
                            Brief
                          </TabsTrigger>
                          <TabsTrigger value="balanced" className="text-xs">
                            Balanced
                          </TabsTrigger>
                          <TabsTrigger value="detailed" className="text-xs">
                            Detailed
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Language</label>
                      <Tabs value={language} onValueChange={setLanguage}>
                        <TabsList className="grid w-full grid-cols-1 h-auto">
                          <TabsTrigger value="english" className="text-xs">
                            English
                          </TabsTrigger>
                          <TabsTrigger value="simple" className="text-xs">
                            Simple
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Accessibility</label>
                      <Tabs value={accessibility} onValueChange={setAccessibility}>
                        <TabsList className="grid w-full grid-cols-1 h-auto">
                          <TabsTrigger value="standard" className="text-xs">
                            Standard
                          </TabsTrigger>
                          <TabsTrigger value="high-contrast" className="text-xs">
                            High Contrast
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Help Me Out</h4>
                    <div className="space-y-2">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                        Skip Question
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                        Explain More
                      </Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                        Previous Question
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Chat Area */}
          <div className={cn("lg:col-span-8", !isMobile && "lg:col-span-8", isMobile && "col-span-1")}>
            {/* Mobile Quick Actions */}
            {isMobile && (
              <div className="mb-4 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Tone: {chatTone}
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Depth: {chatDepth}
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Language: {language}
                  </Button>
                  <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                    Help Me Out
                  </Button>
                </div>
              </div>
            )}

            <Card className="h-full flex flex-col">
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
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
                          {message.content
                            .replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "")
                            .replace(/\[QUESTION_CONTEXT\].*?\[\/QUESTION_CONTEXT\]/s, "")
                            .trim()}
                        </div>

                        {/* Voice playback button for AI messages */}
                        {message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            onClick={() =>
                              speakText(
                                message.content
                                  .replace(/\[DATA_UPDATE\].*?\[\/DATA_UPDATE\]/s, "")
                                  .replace(/\[QUESTION_CONTEXT\].*?\[\/QUESTION_CONTEXT\]/s, "")
                                  .trim(),
                              )
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

              {/* Question Input Widgets */}
              <div className="p-4 border-t">
                {renderQuestionInput()}

                {/* Text Input */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your response..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    disabled={!browserSupportsSpeech}
                    className={isListening ? "bg-red-50 border-red-200" : ""}
                  >
                    {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {transcript && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">Voice: {transcript}</div>
                )}
              </div>
            </Card>
          </div>

          {/* Information Gathered Tab - Desktop */}
          {!isMobile && (
            <div className="lg:col-span-2 relative">
              <div
                className={cn(
                  "absolute right-0 top-0 h-full bg-white border rounded-lg shadow-lg transition-transform duration-300 z-10",
                  infoGatheredOpen ? "translate-x-0" : "translate-x-full",
                )}
                style={{ width: "300px" }}
              >
                <div className="p-4 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Information Gathered</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInfoGatheredOpen(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {Object.keys(conversationData.demographics).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Demographics</h4>
                      <div className="space-y-1 text-xs">
                        {conversationData.demographics.age && <div>Age: {conversationData.demographics.age}</div>}
                        {conversationData.demographics.gender && (
                          <div>Gender: {conversationData.demographics.gender}</div>
                        )}
                        {conversationData.demographics.race && <div>Race: {conversationData.demographics.race}</div>}
                      </div>
                    </div>
                  )}

                  {Object.keys(conversationData.medical).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Medical History</h4>
                      <div className="space-y-1 text-xs">
                        {conversationData.medical.familyHistory &&
                          conversationData.medical.familyHistory.length > 0 && (
                            <div>Family History: {conversationData.medical.familyHistory.join(", ")}</div>
                          )}
                        {conversationData.medical.chronicConditions &&
                          conversationData.medical.chronicConditions.length > 0 && (
                            <div>Conditions: {conversationData.medical.chronicConditions.join(", ")}</div>
                          )}
                      </div>
                    </div>
                  )}

                  {isComplete && (
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-green-600 font-medium mb-2 text-sm">✓ Complete</div>
                        <Button onClick={handleContinue} size="sm" className="w-full">
                          Continue
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Handle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInfoGatheredOpen(!infoGatheredOpen)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 rounded-l-lg rounded-r-none px-2"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", infoGatheredOpen && "rotate-180")} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Information Gathered Modal */}
      {isMobile && infoGatheredOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-1/4 rounded-t-lg p-4 transform transition-transform duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Information Gathered</h3>
              <Button variant="ghost" size="sm" onClick={() => setInfoGatheredOpen(false)} className="h-6 w-6 p-0">
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-full text-sm">
              {/* Same content as desktop version */}
              {Object.keys(conversationData.demographics).length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Demographics</h4>
                  <div className="space-y-1 text-xs">
                    {conversationData.demographics.age && <div>Age: {conversationData.demographics.age}</div>}
                    {conversationData.demographics.gender && <div>Gender: {conversationData.demographics.gender}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
