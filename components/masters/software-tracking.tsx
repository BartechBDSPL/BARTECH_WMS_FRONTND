"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CustomDropdown from "../CustomDropdown";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  softwareTrackingSchema,
  type SoftwareTrackingSchema,
} from "./software-details-schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  CalendarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/Textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { BACKEND_URL } from "@/lib/constants";
import axios from "axios";
import Cookies from "js-cookie";

const Softwaretracking: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SoftwareTrackingSchema>({
    resolver: zodResolver(softwareTrackingSchema),
    defaultValues: {
      warrentyDays: 0,
      qty: 1,
      dateOfWarrentyStart: new Date(),
    },
  });

  // Dummy data for dropdowns
  // const customerNames = ["ABC Company", "XYZ Corporation", "Tech Solutions Ltd", "Global Systems"];
  // const customerAddresses = ["123 Main St, City", "456 Business Park, Town", "789 Tech Lane, Metro"];
  // const contactPersons = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams"];
  // const contactNumbers = ["555-1234", "555-5678", "555-9012", "555-3456"];
  // const emailIDs = ["contact@abc.com", "info@xyz.com", "support@tech.com", "sales@global.com"];

  // const hardwareTypes = ["Printer", "Scanner", "Barcode Reader", "Tablet", "Mobile Computer"];
  // const makes = ["Zebra", "Honeywell", "Datalogic", "Motorola", "Epson"];
  // const models = ["ZT411", "PM43", "DS3608", "TC52", "TM-T88VI"];
  const warrentyStatuses = ["AMC", "Warranty"];

  const [customerNames, setCustomerNames] = useState<
    { CustomerName: string }[]
  >([]);
  const [customerAddress, setCustomerAddress] = useState<string[]>([]);
  const [contactPersons, setcontactPersons] = useState<string[]>([]);
  const [contactNumbers, setcontactNumbers] = useState<string[]>([]);
  const [emailIDs, setemailIDs] = useState<string[]>([]);

  const [softwareTypes, setsoftwareTypes] = useState<
    { SoftwareType: string }[]
  >([]);
  const [makes, setmakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SoftwareTrackingSchema | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // States for dropdowns
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedContactPerson, setSelectedContactPerson] = useState("");
  const [selectedContactNo, setSelectedContactNo] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");

  const [selectedSoftwareType, setSelectedSoftwareType] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedWarrentyStatus, setSelectedWarrentyStatus] = useState("");

  const isStepCompleted = (step: number) => completedSteps.includes(step);

  const token = Cookies.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string>("");

  const goToNextStep = async (step: number, fieldsToValidate: string[]) => {
    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate as any[]);
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description:
            "Please fill in all required fields correctly before proceeding.",
        });
        return;
      }
    }

    setActiveStep(step + 1);
    if (!isStepCompleted(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const goToPreviousStep = (step: number) => {
    if (step > 1) {
      setActiveStep(step - 1);
    }
  };

  useEffect(() => {
    setUsername("admin");

    Promise.all([fetchCustomers(), fetchSoftware()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-soft-customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomerNames(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const fetchCustomerAddresses = async (selectedCustomerName: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-soft-customer-address`,
        { CustomerName: selectedCustomerName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const addressList =
        Array.isArray(response.data) && response.data.length > 0
          ? response.data.map(
              (item: { CustomerAddress: string }) => item.CustomerAddress
            )
          : [];

      setCustomerAddress(addressList); // Save the addresses in state
    } catch (error) {
      console.error("Error fetching customer addresses:", error);
      toast({
        variant: "destructive",
        title: "Error fetching customer addresses",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setCustomerAddress([]);
    }
  };

  const fetchContactPersons = async (
    customerName: string,
    customerAddress: string
  ) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-soft-customer-contact`,
        {
          CustomerName: customerName,
          CustomerAddress: customerAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const contacts =
        Array.isArray(response.data) && response.data.length > 0
          ? response.data.map(
              (item: { ContactPerson: string }) => item.ContactPerson
            )
          : [];

      setcontactPersons(contacts);
    } catch (error) {
      console.error("Error fetching contact persons:", error);
      toast({
        variant: "destructive",
        title: "Error fetching contact persons",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setcontactPersons([]);
    }
  };



  const fetchContactDetails = async (
    customerName: string,
    customerAddress: string,
    contactPerson: string
  ) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-soft-customer-contact-details`,
        {
          CustomerName: customerName,
          CustomerAddress: customerAddress,
          ContactPerson: contactPerson,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const contactNumbers: string[] = [];
      const emailIds: string[] = [];
  
      if (Array.isArray(response.data)) {
        response.data.forEach((item: { ContactNo: string; EmailID: string }) => {
          if (item.ContactNo) contactNumbers.push(item.ContactNo);
          if (item.EmailID) emailIds.push(item.EmailID);
        });
      }
  
      setcontactNumbers(contactNumbers);
      setemailIDs(emailIds);
  
      // ✅ Automatically select the first contact number and email if available
      if (contactNumbers.length > 0) {
        setSelectedContactNo(contactNumbers[0]);
        setValue("contactNo", contactNumbers[0]);
      } else {
        setSelectedContactNo("");
        setValue("contactNo", "");
      }
  
      if (emailIds.length > 0) {
        setSelectedEmail(emailIds[0]);
        setValue("emailID", emailIds[0]);
      } else {
        setSelectedEmail("");
        setValue("emailID", "");
      }
    } catch (error) {
      console.error("Error fetching contact details:", error);
      toast({
        variant: "destructive",
        title: "Error fetching contact details",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setcontactNumbers([]);
      setemailIDs([]);
      setSelectedContactNo("");
      setSelectedEmail("");
      setValue("contactNo", "");
      setValue("emailID", "");
    }
  };
  
  const fetchSoftware = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-software-type`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setsoftwareTypes(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const fetchHardwareTrackingMake = async (selectedHardwareType: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-hardware-tracking-make`,
        { HardwareType: selectedHardwareType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Adjusted to use 'Make' instead of 'HardwareMake'
      const trackingMakeList = Array.isArray(response.data)
        ? response.data.map((item: { Make: string }) => item.Make)
        : [];

      setmakes(trackingMakeList);
    } catch (error) {
      console.error("Error fetching hardware tracking makes:", error);
      toast({
        variant: "destructive",
        title: "Error fetching hardware tracking makes",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      setmakes([]);
    }
  };

  const handleCustomerChange = (value: string) => {
    // Only perform reset if we already had a value and are changing to a new one
    if (selectedCustomer && selectedCustomer !== value) {
      // Reset address and all dependent fields
      setSelectedAddress("");
      setCustomerAddress([]);
      setSelectedContactPerson("");
      setcontactPersons([]);
      setSelectedContactNo("");
      setcontactNumbers([]);
      setSelectedEmail("");
      setemailIDs([]);
      
      // Clear form values for these fields as well
      setValue("customerAddress", "");
      setValue("contactPerson", "");
      setValue("contactNo", "");
      setValue("emailID", "");
    }
    
    // Set the new customer name
    setSelectedCustomer(value);
    
    // Fetch addresses for the new customer
    fetchCustomerAddresses(value);
  }
  const handleAddressChange = (value: string) => {
    setSelectedAddress(value);
    fetchContactPersons(selectedCustomer, value);
  };
  const handleContactChange = (value: string) => {
    setSelectedContactPerson(value);
    fetchContactDetails(selectedCustomer, selectedAddress, value);
  };

  const handleHardwareTypeChange = (value: string) => {
    setSelectedSoftwareType(value);
    setValue("softwareType", value);
    setSelectedMake("");
    setmakes([]);
    fetchHardwareTrackingMake(value);
  };

//   const handleMakeChange = (value: string) => {
//     setSelectedMake(value);
//     setValue("make", value); // optional: for form
//     setSelectedModel("");
//     setModels([]);
//     fetchHardwareTrackingModel(selectedSoftwareType, value);
//   };

//   const handleModelChange = (value: string) => {
//     setSelectedModel(value);
//     setValue("ProjectDesc", value);
//   };

  const handleWarrentyStatusChange = (value: string) => {
    setSelectedWarrentyStatus(value);
    setValue("warrentyStatus", value as "AMC" | "Warranty");
  };

  const handleCustomValueChange =
    (field: keyof SoftwareTrackingSchema) => (value: string) => {
      setValue(field as any, value);
      switch (field) {
        case "customerName":
          setSelectedCustomer(value);
          break;
        case "customerAddress":
          setSelectedAddress(value);
          break;
        case "contactPerson":
          setSelectedContactPerson(value);
          break;
        case "contactNo":
          setSelectedContactNo(value);
          break;
        case "emailID":
          setSelectedEmail(value);
          break;
        case "softwareType":
          setSelectedSoftwareType(value);
          break;
      }
    };

  const handleReset = () => {
    reset();
    setSelectedCustomer("");
    setSelectedAddress("");
    setSelectedContactPerson("");
    setSelectedContactNo("");
    setSelectedEmail("");
    setSelectedSoftwareType("");
    setSelectedMake("");
    setSelectedModel("");
    setSelectedWarrentyStatus("");
    setActiveStep(1);
    setCompletedSteps([]);
  };

  const onSubmitForm = async (data: SoftwareTrackingSchema) => {
    try {
      const formattedDate = data.dateOfWarrentyStart
        ? format(new Date(data.dateOfWarrentyStart), "yyyy-MM-dd")
        : "";

      const processedData = {
        ...data,
      };

      // For preview dialog
      setFormData(processedData);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Form processing error:", error);
      toast({
        variant: "destructive",
        title: "Form Processing Error",
        description: "Could not process form data",
      });
    }
  };

  const submitToApi = async () => {

  
    if (!formData) {

      toast({
        variant: "destructive",
        title: "Data not found",
        description: "Please fill in the required form details before submitting.",
      });
    
      return false;
    }
    
    try {
      const formattedDate = formData.dateOfWarrentyStart
        ? format(formData.dateOfWarrentyStart, "yyyy-MM-dd")
        : "";
  
      const apiData = {
        CustomerName: formData.customerName,
        CustomerAddress: formData.customerAddress,
        ContactPerson: formData.contactPerson,
        ContactNo: formData.contactNo,
        EmailID: formData.emailID,
        Invoice_PONo: formData.invoicePONo,
        SoftwareType: formData.softwareType,
        ProjectTitle: formData.ProjectTitle,
        ProjectDesc: formData.ProjectDesc,
        ProjectVersion: formData.ProjectVersion,
        AdditionalDetails: formData.additionalDetails || "",
        DateOfWarrentyStart: formattedDate,
        WarrentyDays: formData.warrentyDays,
        WarrentyStatus: formData.warrentyStatus,
        Qty: formData.qty,
        SerialNo: formData.serialNo,
        User: username,
      };
  
  
      const response = await axios.post(
        `${BACKEND_URL}/api/master/insert-software-tracking-details`,
        apiData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
  
      if (response.data && response.data.length > 0) {
        const responseData = response.data[0];
        
        if (responseData.Status === "T") {
          toast({
            title: "Success!",
            description: responseData.Message || "Software tracking information saved successfully",
            variant: "default",
          });
  
  
          if (responseData.SerialNo) {
            console.log("📎 QR Code Serial No:", responseData.SerialNo);
          }
  
          handleReset();
          setIsDialogOpen(false);
          return true;
        } else {

          toast({
            variant: "destructive",
            title: "Error",
            description: responseData.Message || "Failed to save software tracking information",
          });
          return false;
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Received invalid response from server",
        });
        return false;
      }
    } catch (error) {
     
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save software tracking information",
      });
      return false;
    }
  };
  // Preview dialog for form submission
  const HardwareTrackingPreviewDialog = () => {
    if (!formData) return null;

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Software Tracking Preview
          </DialogTitle>
        </DialogHeader>

        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto">
          <div className="border border-gray-800">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/3 bg-gray-100">
                    Customer Name
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-2/3">
                    {formData.customerName}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Customer Address
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.customerAddress}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Contact Person
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.contactPerson}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Contact Number
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.contactNo}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Email ID
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.emailID}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Invoice/PO Number
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.invoicePONo}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Hardware Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.softwareType}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                  ProjectTitle
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.ProjectTitle}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Project Description
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.ProjectDesc}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Project Version
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.ProjectVersion}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Additional Details
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.additionalDetails || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Warranty Start Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.dateOfWarrentyStart.toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Warranty Days
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.warrentyDays}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Warranty Status
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.warrentyStatus}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Quantity
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.qty}
                  </td>
                </tr>
                <tr>
                  
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Warranty Expiry Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1">
                    {formData.dateOfWarrentyExp?.toLocaleDateString() || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={submitToApi}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Confirm & Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Step 1: Customer Details Card */}
            <motion.div
              animate={{
                opacity:
                  activeStep === 1 || completedSteps.includes(1) ? 1 : 0.7,
                scale: activeStep === 1 ? 1 : 0.99,
              }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={
                  isStepCompleted(1)
                    ? "border-green-500 dark:border-green-700 border-2"
                    : ""
                }
              >
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${
                    activeStep !== 1 && isStepCompleted(1)
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => isStepCompleted(1) && setActiveStep(1)}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step 1: Customer Details
                    {isStepCompleted(1) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(1) && activeStep !== 1 && (
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <AnimatePresence>
                  {activeStep === 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.customerName ? "text-destructive" : ""
                              }
                            >
                              Customer Name*
                            </Label>
                            <CustomDropdown
                              options={(Array.isArray(customerNames)
                                ? customerNames
                                : []
                              ).map((item) => ({
                                value: item.CustomerName,
                                label: item.CustomerName,
                              }))}
                              value={watch("customerName") || ""}
                              onValueChange={(value) => {
                                setValue("customerName", value);
                                handleCustomerChange(value); // make sure to call it
                              }}
                              placeholder="Select Customer"
                              searchPlaceholder="Search Customer..."
                              emptyText="No customers found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "customerName"
                              )}
                            />

                            {errors.customerName && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.customerName.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.customerAddress ? "text-destructive" : ""
                              }
                            >
                              Customer Address*
                            </Label>
                            <CustomDropdown
                              options={customerAddress.map((address) => ({
                                value: address,
                                label: address,
                              }))}
                              value={watch("customerAddress") || ""} 
                              onValueChange={(value) => {
                                setValue("customerAddress", value); 
                                handleAddressChange(value); 
                              }}
                              placeholder="Select Address"
                              searchPlaceholder="Search address..."
                              emptyText="No addresses found"
                              disabled={!selectedCustomer} 
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "customerAddress"
                              )} // Handle custom values if any
                            />
                            {errors.customerAddress && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.customerAddress.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.contactPerson ? "text-destructive" : ""
                              }
                            >
                              Contact Person*
                            </Label>
                            <CustomDropdown
                              options={contactPersons.map((person) => ({
                                value: person,
                                label: person,
                              }))}
                              // value={selectedContactPerson}
                              value={watch("contactPerson") || ""}
                              // onValueChange={handleContactChange}
                              onValueChange={(value) => {
                                setValue("contactPerson", value); // Update the form value
                                handleContactChange(value); // Trigger additional logic (if needed)
                              }}
                              placeholder="Select Contact Person"
                              searchPlaceholder="Search contact..."
                              emptyText="No contacts found"
                              disabled={!selectedAddress}
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "contactPerson"
                              )}
                            />

                            {errors.contactPerson && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.contactPerson.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.contactNo ? "text-destructive" : ""
                              }
                            >
                              Contact Number
                            </Label>
                            <CustomDropdown
                              options={contactNumbers.map((no) => ({
                                value: no,
                                label: no,
                              }))}
                              value={selectedContactNo}
                              onValueChange={(val) => {
                                setSelectedContactNo(val);
                                setValue("contactNo", val); // If using react-hook-form
                              }}
                              placeholder="Select Contact No"
                              searchPlaceholder="Search number..."
                              emptyText="No contact numbers found"
                              // disabled={!selectedContactPerson}
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "contactNo"
                              )}
                            />

                            {errors.contactNo && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.contactNo.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.emailID ? "text-destructive" : ""
                              }
                            >
                              Email ID
                            </Label>
                            <CustomDropdown
                              options={emailIDs.map((email) => ({
                                value: email,
                                label: email,
                              }))}
                              value={selectedEmail}
                              onValueChange={(val) => {
                                setSelectedEmail(val);
                                setValue("emailID", val);
                              }}
                              placeholder="Select Email"
                              searchPlaceholder="Search email..."
                              emptyText="No email IDs found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "emailID"
                              )}
                            />

                            {errors.emailID && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.emailID.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.invoicePONo ? "text-destructive" : ""
                              }
                            >
                              Invoice/PO Number
                            </Label>
                            <Input
                              {...register("invoicePONo")}
                              placeholder="Enter Invoice/PO Number"
                            />
                            {errors.invoicePONo && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.invoicePONo.message}
                              </motion.p>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={() =>
                              goToNextStep(1, [
                                "customerName",
                                "customerAddress",
                                "contactPerson",
                                // "contactNo",
                                // "emailID",
                                // "invoicePONo",
                              ])
                            }
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Next <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Step 2: Hardware Details */}
            <motion.div
              animate={{
                opacity:
                  activeStep === 2 || completedSteps.includes(2) ? 1 : 0.7,
                scale: activeStep === 2 ? 1 : 0.99,
              }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={
                  isStepCompleted(2)
                    ? "border-green-500 dark:border-green-700 border-2"
                    : ""
                }
              >
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${
                    (activeStep !== 2 && isStepCompleted(2)) || activeStep > 2
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    if (isStepCompleted(2) && activeStep !== 2) {
                      setActiveStep(2);
                    } else if (activeStep > 2) {
                      setActiveStep(2);
                    }
                  }}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step 2: Software Details
                    {isStepCompleted(2) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(2) && activeStep !== 2 && (
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <AnimatePresence>
                  {activeStep === 2 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.softwareType ? "text-destructive" : ""
                              }
                            >
                              Software Type*
                            </Label>
                            <CustomDropdown
                              options={(Array.isArray(softwareTypes)
                                ? softwareTypes
                                : []
                              ).map((item) => ({
                                value: item.SoftwareType,
                                label: item.SoftwareType,
                              }))}
                              value={selectedSoftwareType}
                              onValueChange={handleHardwareTypeChange}
                              placeholder="Select Software Type"
                              searchPlaceholder="Search hardware type..."
                              emptyText="No Software types found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "softwareType"
                              )}
                            />
                            {errors.softwareType && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.softwareType.message}
                              </motion.p>
                            )}
                          </div>
                           
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.ProjectTitle ? "text-destructive" : ""
                              }
                            >
                              Project Title*
                            </Label>
                            <Input
                              {...register("ProjectTitle")}
                              placeholder="Enter Project Title"
                            />
                            {errors.ProjectTitle && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.ProjectTitle.message}
                              </motion.p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.ProjectDesc ? "text-destructive" : ""
                              }
                            >
                              Project Description*
                            </Label>
                            <Input
                              {...register("ProjectDesc")}
                              placeholder="Enter Project Description"
                            />
                            {errors.ProjectDesc && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.ProjectDesc.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.ProjectVersion ? "text-destructive" : ""
                              }
                            >
                              Project Version*
                            </Label>
                            <Input
                              {...register("ProjectVersion")}
                              placeholder="Enter Project Version"
                            />
                            {errors.ProjectVersion && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.ProjectVersion.message}
                              </motion.p>
                            )}
                          </div>
                         
                          <div className="space-y-2">
                            <Label>Additional Details</Label>
                            <Textarea
                              {...register("additionalDetails")}
                              placeholder="Enter additional details about the hardware"
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.dateOfWarrentyStart
                                  ? "text-destructive"
                                  : ""
                              }
                            >
                              Warranty Start Date*
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !watch("dateOfWarrentyStart") &&
                                      "text-muted-foreground",
                                    errors.dateOfWarrentyStart &&
                                      "border-destructive"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {watch("dateOfWarrentyStart") ? (
                                    format(watch("dateOfWarrentyStart"), "PPP")
                                  ) : (
                                    <span>Select warranty start date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={watch("dateOfWarrentyStart")}
                                  onSelect={(date) =>
                                    date &&
                                    setValue("dateOfWarrentyStart", date)
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {errors.dateOfWarrentyStart && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.dateOfWarrentyStart.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.warrentyDays ? "text-destructive" : ""
                              }
                            >
                              Warranty Days*
                            </Label>
                            <Input
                              type="number"
                              {...register("warrentyDays", {
                                valueAsNumber: true,
                              })}
                              placeholder="Enter warranty period in days"
                            />
                            {errors.warrentyDays && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.warrentyDays.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.warrentyStatus ? "text-destructive" : ""
                              }
                            >
                              Warranty Status*
                            </Label>
                            <CustomDropdown
                              options={warrentyStatuses.map((status) => ({
                                value: status,
                                label: status,
                              }))}
                              value={selectedWarrentyStatus}
                              onValueChange={handleWarrentyStatusChange}
                              placeholder="Select Warranty Status"
                              searchPlaceholder="Search status..."
                              emptyText="No statuses found"
                            />
                            {errors.warrentyStatus && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.warrentyStatus.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={errors.qty ? "text-destructive" : ""}
                            >
                              Quantity*
                            </Label>
                            <Input
                              type="number"
                              {...register("qty", { valueAsNumber: true })}
                              placeholder="Enter quantity"
                            />
                            {errors.qty && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.qty.message}
                              </motion.p>
                            )}
                          </div>
                         
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => goToPreviousStep(2)}
                          >
                            <ChevronUp className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <div className="space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleReset}
                              disabled={isSubmitting}
                            >
                              Reset
                            </Button>
                            <Button
                              type="button"
                              disabled={isSubmitting || isProcessing}
                              onClick={async () => {
                                try {
                                  // First set loading state
                                  setIsProcessing(true);
                                  
                                  // Trigger validation for all required hardware details fields
                                  const isValid = await trigger([
                                    "softwareType",
                                    "ProjectTitle",
                                    "ProjectDesc",
                                    "ProjectVersion",
                                    "dateOfWarrentyStart",
                                    "warrentyDays",
                                    "warrentyStatus",
                                    "qty"
                                  ]);
                                  
                                  if (isValid) {
                                    const currentData = getValues();
                                    
                              
                                    
                                    // Continue only if serial is unique
                                    
                                    // Calculate warranty expiry date if warranty days exists
                                    let expiryDate = undefined;
                                    if (currentData.dateOfWarrentyStart && currentData.warrentyDays) {
                                      expiryDate = new Date(currentData.dateOfWarrentyStart);
                                      expiryDate.setDate(expiryDate.getDate() + currentData.warrentyDays);
                                    }
                                    
                                    // Process data for preview
                                    const processedData = {
                                      ...currentData,
                                      dateOfWarrentyExp: expiryDate
                                    };

                                    // Set form data for preview and open dialog
                                    setFormData(processedData);
                                    setIsDialogOpen(true);
                                    
                                    // Mark the step as completed
                                    setCompletedSteps((prev) => [...prev.filter(step => step !== 2), 2]);
                                  }
                                } catch (error) {
                                  console.error("Error during validation:", error);
                                  toast({
                                    variant: "destructive",
                                    title: "Validation Error",
                                    description: error instanceof Error ? error.message : "An error occurred during validation",
                                  });
                                } finally {
                                  setIsProcessing(false);
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {(isSubmitting || isProcessing) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {isSubmitting || isProcessing ? "Saving..." : "Save Software Details"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </form>
        </motion.div>
      </AnimatePresence>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <HardwareTrackingPreviewDialog />
      </Dialog>
    </>
  );
};

export default Softwaretracking;
