"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
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

      <p className="text-xs text-gray-500 text-center mt-4">
        This tool is for educational purposes and does not replace professional medical advice.
      </p>
    </div>
  )
}
