"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

const cancerStats = [
  {
    id: 1,
    title: "Breast Cancer Prevalence",
    statistic: "Most Common Cancer",
    description: "In 2022, breast cancer was the most common cancer among women in all ten ASEAN countries",
    highlight: "All 10 ASEAN Countries",
    color: "bg-pink-50 border-pink-200",
  },
  {
    id: 2,
    title: "Cancer Mortality",
    statistic: "Leading Cause of Death",
    description: "Breast cancer is the most common cause of cancer mortality among women in five ASEAN countries",
    highlight: "5 ASEAN Countries",
    color: "bg-red-50 border-red-200",
  },
  {
    id: 3,
    title: "Singapore Statistics",
    statistic: "39.4%",
    description: "Colorectum cancer is the most common cancer in men in Singapore at 39.4%",
    highlight: "Singapore Men",
    color: "bg-blue-50 border-blue-200",
  },
  {
    id: 4,
    title: "Regional Overview",
    statistic: "Primary Drivers",
    description:
      "In 2022, cancer incidence and mortality in SEA were driven primarily by breast cancer among women and lung cancer among men",
    highlight: "Southeast Asia",
    color: "bg-purple-50 border-purple-200",
  },
]

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % cancerStats.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? cancerStats.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cancerStats.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">EarlyDetect</h1>
        <p className="text-gray-600">Your AI-powered cancer screening companion</p>
      </div>

      <div className="space-y-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-4">
            <Heart className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="font-semibold">Personalized Care</h3>
              <p className="text-sm text-gray-600">Tailored screening recommendations</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Zap className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-semibold">AI-Powered</h3>
              <p className="text-sm text-gray-600">Advanced LLM technology</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <h3 className="font-semibold">Easy Booking</h3>
              <p className="text-sm text-gray-600">Find nearby clinics instantly</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Link href="/questionnaire" className="w-full">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">Start Your Health Assessment</Button>
      </Link>

      {/* Cancer Statistics Carousel */}
      <div className="mt-8 mb-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Cancer Screening Insights</h2>
          <p className="text-sm text-gray-600">Key statistics from ASEAN and Southeast Asia</p>
        </div>

        <div className="relative">
          {/* Main carousel container */}
          <div className="overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {cancerStats.map((stat) => (
                <div key={stat.id} className="w-full flex-shrink-0">
                  <Card className={`${stat.color} min-h-[200px] flex items-center justify-center`}>
                    <CardContent className="text-center p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-white/80 rounded-full text-xs font-medium text-gray-700 mb-2">
                          {stat.highlight}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{stat.title}</h3>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{stat.statistic}</div>
                      <p className="text-sm text-gray-700 leading-relaxed">{stat.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center mt-4 space-x-3">
          {/* Dot indicators */}
          <div className="flex space-x-1">
            {cancerStats.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-gray-800" : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoPlay}
            className="ml-2 bg-transparent text-xs px-2 py-1 h-6"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" />
                Play
              </>
            )}
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="mt-2 text-center text-xs text-gray-500">
          {currentIndex + 1} of {cancerStats.length}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        This tool is for educational purposes and does not replace professional medical advice.
      </p>
    </div>
  )
}
