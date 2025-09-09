"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconLoader,
  IconInnerShadowTop,
  IconCircle,
  IconBuilding,
  IconUsers,
  IconCreditCard,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function OrganizationSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: "",
    businessType: "",
    registrationNumber: "",
    taxId: "",
    website: "",
    description: "",

    // Contact Information
    businessAddress: "",
    city: "",
    state: "",
    country: "Ghana",
    postalCode: "",
    phoneNumber: "",

    // Business Operations
    estimatedMonthlyVolume: "",
    estimatedMonthlyTransactions: "",
    numberOfOutlets: "",
    operationalBranches: "",
    primaryServices: "",

    // Admin User Details
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminPosition: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <IconCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Registration Submitted!</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Thank you for registering your organization with Rexpay. Our team will review your application and contact
              you within 2-3 business days.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              An admin account will be created for <strong>{formData.adminEmail}</strong> once approved.
            </p>
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">What happens next?</h3>
                <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Application review (1-2 business days)</li>
                  <li>• Fee structure determination</li>
                  <li>• Admin account creation</li>
                  <li>• Welcome email with login credentials</li>
                </ul>
              </div>
              <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <IconInnerShadowTop className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Join Rexpay</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Register your organization to start processing payments
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {step === 1 && <IconBuilding className="w-4 h-4" />}
                  {step === 2 && <IconCreditCard className="w-4 h-4" />}
                  {step === 3 && <IconUsers className="w-4 h-4" />}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? "text-primary font-medium" : "text-gray-500"}`}>
                  {step === 1 && "Organization"}
                  {step === 2 && "Business Details"}
                  {step === 3 && "Admin User"}
                </span>
                {step < 3 && <div className={`ml-8 w-16 h-0.5 ${currentStep > step ? "bg-primary" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Organization Information"}
              {currentStep === 2 && "Business Operations"}
              {currentStep === 3 && "Administrator Details"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about your organization"}
              {currentStep === 2 && "Help us understand your business needs"}
              {currentStep === 3 && "Set up your organization administrator"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Organization Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="Acme Corporation Ltd"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange("organizationName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => handleInputChange("businessType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank</SelectItem>
                          <SelectItem value="fintech">Fintech</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="telecommunications">Telecommunications</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Business Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        type="text"
                        placeholder="BN123456789"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / TIN</Label>
                      <Input
                        id="taxId"
                        type="text"
                        placeholder="TIN123456789"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange("taxId", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.example.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your business and services"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address *</Label>
                      <Textarea
                        id="businessAddress"
                        placeholder="Street address, building name, etc."
                        value={formData.businessAddress}
                        onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                        required
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Accra"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Region *</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder="Greater Accra"
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          type="text"
                          placeholder="GA-123-4567"
                          value={formData.postalCode}
                          onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Business Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Operations */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Transaction Volume Information
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This information helps us determine the most suitable fee structure for your organization.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedMonthlyVolume">Estimated Monthly Transaction Volume (GHS) *</Label>
                      <Select
                        value={formData.estimatedMonthlyVolume}
                        onValueChange={(value) => handleInputChange("estimatedMonthlyVolume", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select volume range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-50000">GHS 0 - 50,000</SelectItem>
                          <SelectItem value="50000-200000">GHS 50,000 - 200,000</SelectItem>
                          <SelectItem value="200000-500000">GHS 200,000 - 500,000</SelectItem>
                          <SelectItem value="500000-1000000">GHS 500,000 - 1,000,000</SelectItem>
                          <SelectItem value="1000000-5000000">GHS 1,000,000 - 5,000,000</SelectItem>
                          <SelectItem value="5000000+">GHS 5,000,000+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedMonthlyTransactions">Estimated Monthly Transaction Count *</Label>
                      <Select
                        value={formData.estimatedMonthlyTransactions}
                        onValueChange={(value) => handleInputChange("estimatedMonthlyTransactions", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transaction count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-100">0 - 100 transactions</SelectItem>
                          <SelectItem value="100-500">100 - 500 transactions</SelectItem>
                          <SelectItem value="500-1000">500 - 1,000 transactions</SelectItem>
                          <SelectItem value="1000-5000">1,000 - 5,000 transactions</SelectItem>
                          <SelectItem value="5000-10000">5,000 - 10,000 transactions</SelectItem>
                          <SelectItem value="10000+">10,000+ transactions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numberOfOutlets">Number of Outlets/Branches *</Label>
                      <Select
                        value={formData.numberOfOutlets}
                        onValueChange={(value) => handleInputChange("numberOfOutlets", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of outlets" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 outlet</SelectItem>
                          <SelectItem value="2-5">2 - 5 outlets</SelectItem>
                          <SelectItem value="6-10">6 - 10 outlets</SelectItem>
                          <SelectItem value="11-25">11 - 25 outlets</SelectItem>
                          <SelectItem value="26-50">26 - 50 outlets</SelectItem>
                          <SelectItem value="50+">50+ outlets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operationalBranches">Operational Regions</Label>
                      <Input
                        id="operationalBranches"
                        type="text"
                        placeholder="e.g., Greater Accra, Ashanti, Northern"
                        value={formData.operationalBranches}
                        onChange={(e) => handleInputChange("operationalBranches", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryServices">Primary Services/Products *</Label>
                    <Textarea
                      id="primaryServices"
                      placeholder="Describe your main services or products that will require payment processing"
                      value={formData.primaryServices}
                      onChange={(e) => handleInputChange("primaryServices", e.target.value)}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Fee Structure</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Based on your transaction volume and business requirements, our team will provide you with either
                      our standard fee structure or a custom pricing plan.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Admin User Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Administrator Account</h3>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      This person will be the primary administrator for your organization and will receive login
                      credentials once your application is approved.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminFirstName">First Name *</Label>
                      <Input
                        id="adminFirstName"
                        type="text"
                        placeholder="John"
                        value={formData.adminFirstName}
                        onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminLastName">Last Name *</Label>
                      <Input
                        id="adminLastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.adminLastName}
                        onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Email Address *</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@yourcompany.com"
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      This email will be used for login and important notifications
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminPhone">Phone Number *</Label>
                      <Input
                        id="adminPhone"
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={formData.adminPhone}
                        onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminPosition">Position/Title *</Label>
                      <Input
                        id="adminPosition"
                        type="text"
                        placeholder="IT Manager, Finance Director, etc."
                        value={formData.adminPosition}
                        onChange={(e) => handleInputChange("adminPosition", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">What happens after registration?</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Your application will be reviewed within 2-3 business days</li>
                      <li>• Our team will contact you to discuss fee structures and requirements</li>
                      <li>• Once approved, an admin account will be created</li>
                      <li>• You'll receive login credentials and can start managing users</li>
                      <li>• Your admin can then add team members and assign roles</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <div>
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
