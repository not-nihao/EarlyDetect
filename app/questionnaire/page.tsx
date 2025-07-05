"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"

interface QuestionnaireData {
  // Demographics
  age: string
  gender: string
  race: string
  postalCode: string

  // Medical History
  chronicConditions: string[]
  medications: string
  previousScreenings: string[]
  familyHistory: string[]

  // Lifestyle
  smokingStatus: string
  alcoholConsumption: string
  physicalActivity: string
  sexualActivity: string

  // Additional
  concerns: string
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuestionnaireData>({
    age: "",
    gender: "",
    race: "",
    postalCode: "",
    chronicConditions: [],
    medications: "",
    previousScreenings: [],
    familyHistory: [],
    smokingStatus: "",
    alcoholConsumption: "",
    physicalActivity: "",
    sexualActivity: "",
    concerns: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Store data and navigate to personality selection
      localStorage.setItem("questionnaireData", JSON.stringify(formData))
      router.push("/personality")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCheckboxChange = (field: keyof QuestionnaireData, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter((item) => item !== value),
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="age">Age: {formData.age || 18}</Label>
              <div className="px-2 py-4">
                <Slider
                  value={[Number.parseInt(formData.age) || 18]}
                  onValueChange={(value) => setFormData({ ...formData, age: value[0].toString() })}
                  max={100}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>18</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="race">Race/Ethnicity</Label>
              <Select value={formData.race} onValueChange={(value) => setFormData({ ...formData, race: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your race/ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="malay">Malay</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="eurasian">Eurasian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="Enter your postal code"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Chronic Conditions (Select all that apply)</Label>
              <div className="space-y-2 mt-2">
                {["Diabetes", "Hypertension", "Heart Disease", "COPD", "Kidney Disease", "None"].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={formData.chronicConditions.includes(condition)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("chronicConditions", condition, checked as boolean)
                      }
                    />
                    <Label htmlFor={condition}>{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                placeholder="List your current medications (optional)"
              />
            </div>

            <div>
              <Label>Previous Cancer Screenings (Select all that apply)</Label>
              <div className="space-y-2 mt-2">
                {["Mammogram", "Pap Smear", "Colonoscopy", "PSA Test", "Chest X-ray", "None"].map((screening) => (
                  <div key={screening} className="flex items-center space-x-2">
                    <Checkbox
                      id={screening}
                      checked={formData.previousScreenings.includes(screening)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("previousScreenings", screening, checked as boolean)
                      }
                    />
                    <Label htmlFor={screening}>{screening}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Family History of Cancer (Select all that apply)</Label>
              <div className="space-y-2 mt-2">
                {[
                  "Breast Cancer",
                  "Colorectal Cancer",
                  "Lung Cancer",
                  "Prostate Cancer",
                  "Ovarian Cancer",
                  "Other Cancer",
                  "None",
                ].map((cancer) => (
                  <div key={cancer} className="flex items-center space-x-2">
                    <Checkbox
                      id={cancer}
                      checked={formData.familyHistory.includes(cancer)}
                      onCheckedChange={(checked) => handleCheckboxChange("familyHistory", cancer, checked as boolean)}
                    />
                    <Label htmlFor={cancer}>{cancer}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Smoking Status</Label>
              <RadioGroup
                value={formData.smokingStatus}
                onValueChange={(value) => setFormData({ ...formData, smokingStatus: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never">Never smoked</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="former" id="former" />
                  <Label htmlFor="former">Former smoker</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="current" id="current" />
                  <Label htmlFor="current">Current smoker</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Physical Activity Level</Label>
              <RadioGroup
                value={formData.physicalActivity}
                onValueChange={(value) => setFormData({ ...formData, physicalActivity: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sedentary" id="sedentary" />
                  <Label htmlFor="sedentary">Sedentary (little to no exercise)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate (1-3 times/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (4+ times/week)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Sexual Activity</Label>
              <RadioGroup
                value={formData.sexualActivity}
                onValueChange={(value) => setFormData({ ...formData, sexualActivity: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="sexually-active" />
                  <Label htmlFor="sexually-active">Sexually active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="sexually-inactive" />
                  <Label htmlFor="sexually-inactive">Not sexually active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                  <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="concerns">Any specific health concerns?</Label>
              <Textarea
                id="concerns"
                value={formData.concerns}
                onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
                placeholder="Share any concerns or symptoms (optional)"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Health Assessment</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Personal Information"}
            {currentStep === 2 && "Medical History"}
            {currentStep === 3 && "Family History"}
            {currentStep === 4 && "Lifestyle Factors"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about yourself"}
            {currentStep === 2 && "Your medical background"}
            {currentStep === 3 && "Family medical history"}
            {currentStep === 4 && "Lifestyle and habits"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center bg-transparent"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button onClick={handleNext} className="flex items-center">
          {currentStep === totalSteps ? "Complete" : "Next"}
          {currentStep !== totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </div>
    </div>
  )
}
