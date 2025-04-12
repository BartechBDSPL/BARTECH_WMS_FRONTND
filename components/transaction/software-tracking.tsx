'use client'
// Software-tracking.tsx - Multi-step form with improved navigation and collapsible steps
import { useState, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, CheckIcon } from "lucide-react"

// Define types for form data and errors
interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  occupation: string;
  company: string;
  experience: string;
}

interface FormErrors {
  [key: string]: string;
}

interface StepStatus {
  completed: boolean;
  active: boolean;
  expanded: boolean;
}

export default function SoftwareTracking(): JSX.Element {
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    occupation: '',
    company: '',
    experience: ''
  })

  // State for validation errors
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    occupation: '',
    company: '',
    experience: ''
  })

  // Current step state
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [stepStatus, setStepStatus] = useState<StepStatus[]>([
    { completed: false, active: true, expanded: true },
    { completed: false, active: false, expanded: false },
    { completed: false, active: false, expanded: false }
  ])
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [previousStep, setPreviousStep] = useState<number>(0)

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  // Validate step 1
  const validateStep1 = (): boolean => {
    let valid = true
    const newErrors: FormErrors = { ...errors }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
      valid = false
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
      valid = false
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
      valid = false
    }
    
    setErrors(newErrors)
    return valid
  }

  // Validate step 2
  const validateStep2 = (): boolean => {
    let valid = true
    const newErrors: FormErrors = { ...errors }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
      valid = false
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
      valid = false
    }
    
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
      valid = false
    }
    
    setErrors(newErrors)
    return valid
  }

  // Validate step 3
  const validateStep3 = (): boolean => {
    let valid = true
    const newErrors: FormErrors = { ...errors }
    
    if (!formData.occupation.trim()) {
      newErrors.occupation = 'Occupation is required'
      valid = false
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
      valid = false
    }
    
    setErrors(newErrors)
    return valid
  }

  // Complete a step and move to the next
  const completeStep = (step: number): void => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }
    
    if (isValid) {
      const newStatus = [...stepStatus];
      // Mark current step as completed
      newStatus[step - 1] = { completed: true, active: false, expanded: false };
      
      if (step < 3) {
        // Set next step as active
        newStatus[step] = { completed: false, active: true, expanded: true };
        setCurrentStep(step + 1);
      } else {
        // All steps completed
        setIsSubmitted(true);
      }
      
      setStepStatus(newStatus);
    }
  }

  // Save edits and continue to the step you were on before editing
  const saveEditsAndContinue = (step: number): void => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }
    
    if (isValid) {
      const newStatus = [...stepStatus];
      // Mark current step as completed
      newStatus[step - 1] = { ...newStatus[step - 1], completed: true, active: false, expanded: false };
      
      // If we have a previous step to return to
      if (previousStep > 0 && previousStep <= 3) {
        const nextStepToActivate = previousStep > step ? previousStep : step + 1;
        
        if (nextStepToActivate <= 3) {
          // Activate the next step we should go to
          newStatus.forEach((s, idx) => {
            if (idx === nextStepToActivate - 1) {
              newStatus[idx] = { ...newStatus[idx], active: true, expanded: true };
            } else {
              newStatus[idx] = { ...newStatus[idx], active: false };
            }
          });
          
          setCurrentStep(nextStepToActivate);
        }
        
        // Reset previous step
        setPreviousStep(0);
      } else {
        // Normal flow if no previous step
        if (step < 3) {
          newStatus[step] = { ...newStatus[step], active: true, expanded: true };
          setCurrentStep(step + 1);
        }
      }
      
      setStepStatus(newStatus);
    }
  }

  // Activate a specific step (if it's already completed or it's the next step)
  const activateStep = (step: number): void => {
    // Can only activate a step if it's already completed or it's the next available step
    const canActivate = stepStatus[step - 1].completed || 
                         (step === 1) || 
                         (step > 1 && stepStatus[step - 2].completed);
    
    if (canActivate) {
      // Save current step for later
      setPreviousStep(currentStep);
      
      const newStatus = [...stepStatus];
      // Set all steps as inactive
      newStatus.forEach((s, idx) => {
        newStatus[idx] = { ...s, active: false, expanded: false };
      });
      
      // Set the selected step as active and expanded
      newStatus[step - 1] = { ...newStatus[step - 1], active: true, expanded: true };
      
      setStepStatus(newStatus);
      setCurrentStep(step);
    }
  }

  // Toggle expansion of a step
  const toggleStepExpansion = (step: number): void => {
    if (stepStatus[step - 1].completed || stepStatus[step - 1].active) {
      const newStatus = [...stepStatus];
      newStatus[step - 1] = { 
        ...newStatus[step - 1], 
        expanded: !newStatus[step - 1].expanded 
      };
      setStepStatus(newStatus);
    }
  }

  // Reset the form to start over
  const resetForm = (): void => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      occupation: '',
      company: '',
      experience: ''
    });
    setStepStatus([
      { completed: false, active: true, expanded: true },
      { completed: false, active: false, expanded: false },
      { completed: false, active: false, expanded: false }
    ]);
    setCurrentStep(1);
    setIsSubmitted(false);
    setPreviousStep(0);
    setErrors({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      occupation: '',
      company: '',
      experience: ''
    });
  }

  return (
    <div className="w-full max-w-full mx-auto space-y-6">
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center">All Steps Completed!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.2 
                }}
                className="flex justify-center"
              >
                <CheckCircle className="mb-4 text-green-500" size={64} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-medium">Thank you for your submission, {formData.name}!</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-2">Form Summary:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div>{formData.name}</div>
                    <div className="font-medium">Email:</div>
                    <div>{formData.email}</div>
                    <div className="font-medium">Phone:</div>
                    <div>{formData.phone}</div>
                    <div className="font-medium">Address:</div>
                    <div>{formData.address}</div>
                    <div className="font-medium">City:</div>
                    <div>{formData.city}</div>
                    <div className="font-medium">Postal Code:</div>
                    <div>{formData.postalCode}</div>
                    <div className="font-medium">Occupation:</div>
                    <div>{formData.occupation}</div>
                    <div className="font-medium">Company:</div>
                    <div>{formData.company}</div>
                    <div className="font-medium">Experience:</div>
                    <div>{formData.experience} years</div>
                  </div>
                </div>
                
                <Button onClick={resetForm} className="mt-4">
                  Start New Form
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`w-full border-2 ${stepStatus[0].active ? 'border-blue-500' : stepStatus[0].completed ? 'border-green-500' : 'border-gray-200'}`}>
              <CardHeader 
                className="flex flex-row items-center justify-between pb-2 cursor-pointer" 
                onClick={() => toggleStepExpansion(1)}
              >
                <div>
                  <CardTitle className="text-xl flex items-center">
                    {stepStatus[0].completed && (
                      <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    Step 1: Customer Details
                  </CardTitle>
                  {stepStatus[0].expanded && (
                    <CardDescription>
                      Enter Customer Details
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-800 font-medium mr-2">
                    1
                  </div>
                  {stepStatus[0].expanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {stepStatus[0].expanded && (
                  <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <CardContent className={stepStatus[0].active ? '' : 'opacity-70'}>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Customer</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          disabled={!stepStatus[0].active}
                        />
                        <AnimatePresence>
                          {errors.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center text-red-500 text-sm mt-1"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span>{errors.name}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          disabled={!stepStatus[0].active}
                        />
                        <AnimatePresence>
                          {errors.email && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center text-red-500 text-sm mt-1"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span>{errors.email}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          disabled={!stepStatus[0].active}
                        />
                        <AnimatePresence>
                          {errors.phone && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center text-red-500 text-sm mt-1"
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              <span>{errors.phone}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                
                  <CardFooter className="flex justify-end">
                    {stepStatus[0].completed ? (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => activateStep(1)}
                          disabled={stepStatus[0].active}
                        >
                          Edit
                        </Button>
                        {previousStep > 0 && (
                          <Button 
                            onClick={() => saveEditsAndContinue(1)}
                            disabled={!stepStatus[0].active}
                          >
                            Save & Continue
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={() => completeStep(1)}
                        disabled={!stepStatus[0].active}
                      >
                        Continue
                      </Button>
                    )}
                  </CardFooter>
                </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className={`w-full border-2 ${stepStatus[1].active ? 'border-blue-500' : stepStatus[1].completed ? 'border-green-500' : 'border-gray-200'}`}>
              <CardHeader 
                className="flex flex-row items-center justify-between pb-2 cursor-pointer" 
                onClick={() => toggleStepExpansion(2)}
              >
                <div>
                  <CardTitle className="text-xl flex items-center">
                    {stepStatus[1].completed && (
                      <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    Step 2: Hardware  Details
                  </CardTitle>
                  {stepStatus[1].expanded && (
                    <CardDescription>
                      Enter your address details
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-800 font-medium mr-2">
                    2
                  </div>
                  {stepStatus[1].expanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {stepStatus[1].expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <CardContent className={stepStatus[1].active ? '' : 'opacity-70'}>
                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            disabled={!stepStatus[1].active}
                          />
                          <AnimatePresence>
                            {errors.address && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-red-500 text-sm mt-1"
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{errors.address}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter your city"
                            disabled={!stepStatus[1].active}
                          />
                          <AnimatePresence>
                            {errors.city && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-red-500 text-sm mt-1"
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{errors.city}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="Enter your postal code"
                            disabled={!stepStatus[1].active}
                          />
                          <AnimatePresence>
                            {errors.postalCode && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-red-500 text-sm mt-1"
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{errors.postalCode}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-end">
                      {stepStatus[1].completed ? (
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => activateStep(2)}
                            disabled={stepStatus[1].active}
                          >
                            Edit
                          </Button>
                          {previousStep > 0 && (
                            <Button 
                              onClick={() => saveEditsAndContinue(2)}
                              disabled={!stepStatus[1].active}
                            >
                              Save & Continue
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button 
                          onClick={() => completeStep(2)}
                          disabled={!stepStatus[1].active}
                        >
                          Continue
                        </Button>
                      )}
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className={`w-full border-2 ${stepStatus[2].active ? 'border-blue-500' : stepStatus[2].completed ? 'border-green-500' : 'border-gray-200'}`}>
              <CardHeader 
                className="flex flex-row items-center justify-between pb-2 cursor-pointer" 
                onClick={() => toggleStepExpansion(3)}
              >
                <div>
                  <CardTitle className="text-xl flex items-center">
                    {stepStatus[2].completed && (
                      <CheckIcon className="h-5 w-5 mr-2 text-green-500" />
                    )}
                    Step 3: Serial No
                  </CardTitle>
                  {stepStatus[2].expanded && (
                    <CardDescription>
                      Enter your work details
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-800 font-medium mr-2">
                    3
                  </div>
                  {stepStatus[2].expanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {stepStatus[2].expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <CardContent className={stepStatus[2].active ? '' : 'opacity-70'}>
                      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            name="occupation"
                            value={formData.occupation}
                            onChange={handleChange}
                            placeholder="Enter your occupation"
                            disabled={!stepStatus[2].active}
                          />
                          <AnimatePresence>
                            {errors.occupation && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-red-500 text-sm mt-1"
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{errors.occupation}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            disabled={!stepStatus[2].active}
                          />
                          <AnimatePresence>
                            {errors.company && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center text-red-500 text-sm mt-1"
                              >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                <span>{errors.company}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Years of experience"
                            disabled={!stepStatus[2].active}
                          />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={() => completeStep(3)}
                        disabled={!stepStatus[2].active}
                      >
                        Submit
                      </Button>
                    </CardFooter>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}