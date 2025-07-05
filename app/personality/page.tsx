"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Brain, Heart, Zap, Users } from "lucide-react"
import { useRouter } from "next/navigation"

const personalities = [
  {
    id: "analytical",
    name: "Analytical",
    description: "Data-driven, precise, and evidence-based approach",
    icon: Brain,
    color: "text-blue-600",
  },
  {
    id: "empathetic",
    name: "Empathetic",
    description: "Warm, understanding, and emotionally supportive",
    icon: Heart,
    color: "text-red-600",
  },
  {
    id: "enthusiastic",
    name: "Enthusiastic",
    description: "Energetic, motivating, and encouraging",
    icon: Zap,
    color: "text-yellow-600",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Formal, thorough, and medically focused",
    icon: Users,
    color: "text-green-600",
  },
]

export default function PersonalityPage() {
  const router = useRouter()
  const [selectedPersonality, setSelectedPersonality] = useState("")

  const handleContinue = () => {
    if (selectedPersonality) {
      localStorage.setItem("selectedPersonality", selectedPersonality)
      router.push("/chat")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Choose Your AI Assistant</h1>
        <p className="text-gray-600">Select the personality that feels most comfortable for you</p>
      </div>

      <RadioGroup value={selectedPersonality} onValueChange={setSelectedPersonality}>
        <div className="space-y-4">
          {personalities.map((personality) => {
            const IconComponent = personality.icon
            return (
              <Card
                key={personality.id}
                className={`cursor-pointer transition-all ${
                  selectedPersonality === personality.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={personality.id} id={personality.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      <IconComponent className={`h-6 w-6 ${personality.color}`} />
                      <div>
                        <Label htmlFor={personality.id} className="text-base font-semibold cursor-pointer">
                          {personality.name}
                        </Label>
                        <p className="text-sm text-gray-600">{personality.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </RadioGroup>

      <Button onClick={handleContinue} disabled={!selectedPersonality} className="w-full mt-6">
        Continue to Chat
      </Button>
    </div>
  )
}
