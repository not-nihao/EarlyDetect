"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

const clinics = [
  {
    id: "1",
    name: "Singapore General Hospital",
    address: "1 Hospital Drive, Singapore 169608",
    distance: "2.3 km",
    phone: "+65 6222 3322",
  },
  {
    id: "2",
    name: "Raffles Medical Centre",
    address: "585 North Bridge Road, Singapore 188770",
    distance: "3.1 km",
    phone: "+65 6311 1111",
  },
  {
    id: "3",
    name: "Mount Elizabeth Hospital",
    address: "3 Mount Elizabeth, Singapore 228510",
    distance: "4.2 km",
    phone: "+65 6737 2666",
  },
]

const screeningTypes = ["Mammogram", "Pap Smear", "Colonoscopy", "PSA Test", "Chest X-ray", "Full Body Screening"]

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
]

export default function BookingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clinic: "",
    screeningType: "Mammogram",
    date: "",
    time: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store booking data
    localStorage.setItem("bookingData", JSON.stringify(formData))
    router.push("/recommendations")
  }

  const selectedClinic = clinics.find((clinic) => clinic.id === formData.clinic)

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Book Your Screening</h1>
        <p className="text-gray-600">Schedule your recommended cancer screening</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Select Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.clinic} onValueChange={(value) => setFormData({ ...formData, clinic: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a nearby clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    <div>
                      <div className="font-medium">{clinic.name}</div>
                      <div className="text-sm text-gray-500">{clinic.distance} away</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClinic && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                  <div className="text-sm">
                    <p className="font-medium">{selectedClinic.name}</p>
                    <p className="text-gray-600">{selectedClinic.address}</p>
                    <div className="flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{selectedClinic.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screening Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="screeningType">Screening Type</Label>
              <Select
                value={formData.screeningType}
                onValueChange={(value) => setFormData({ ...formData, screeningType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {screeningTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requirements or questions..."
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={!formData.clinic || !formData.date || !formData.time}>
          Confirm Booking
        </Button>
      </form>
    </div>
  )
}
