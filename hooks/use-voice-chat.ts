"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useVoiceChat() {
  const [isListening, setIsListening] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setBrowserSupportsSpeech(!!SpeechRecognition)

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        setIsRecording(true)
        setError(null)
      }

      recognition.onend = () => {
        setIsListening(false)
        setIsRecording(false)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)

        // Auto-stop after 3 seconds of silence
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
          }
        }, 3000)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error)
        setIsListening(false)
        setIsRecording(false)

        // Handle specific errors
        switch (event.error) {
          case "no-speech":
            setError("No speech detected. Please try again.")
            break
          case "audio-capture":
            setError("Microphone not accessible. Please check permissions.")
            break
          case "not-allowed":
            setError("Microphone permission denied. Please allow microphone access.")
            break
          case "network":
            setError("Network error. Please check your connection.")
            break
          default:
            setError(`Speech recognition error: ${event.error}`)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isListening])

  const startListening = useCallback(() => {
    if (!browserSupportsSpeech || !recognitionRef.current) {
      setError("Speech recognition not supported")
      return
    }

    try {
      setError(null)
      setTranscript("")
      recognitionRef.current.start()
    } catch (err) {
      setError("Failed to start speech recognition")
      console.error("Speech recognition error:", err)
    }
  }, [browserSupportsSpeech])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setError(null)
  }, [])

  return {
    isListening,
    isRecording,
    transcript,
    error,
    browserSupportsSpeech,
    startListening,
    stopListening,
    resetTranscript,
  }
}
