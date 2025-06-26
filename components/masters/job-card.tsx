"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CustomDropdown from "../CustomDropdown";
import getUserID, { BACKEND_URL } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MultiSelect } from "../multi-select";
import { zodResolver } from "@hookform/resolvers/zod";
// import { jobCardSchema, type JobCardSchema } from "./job-card-schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  Printer,
  CalendarIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import FileUpload from "../ui/file-upload";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import { format, set } from "date-fns";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import DateTimePicker from "@/utills/DateTimePickerProps";
import {
  jobCardControlSchema,
  type JobCardControlSchema,
} from "./job-card-controller-schema";
import { formatDateToDDMMYY } from "@/utills/dateUtils";
import { getWindingImagePath } from '@/utills/new/getWindingImagePath';

interface CustomDropdownOptions {
  label: string;
  value: string;
}
interface JcAllData {
  ColorNo: number;
  CylinderCode: number;
  UpsAcross: number;
  UpsAlong: number;
}

const JobCard: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<JobCardControlSchema>({
    resolver: zodResolver(jobCardControlSchema),
    defaultValues: {
      colors: Array(9).fill({ color: "", anilox: "", bcm: "" }),
      oldProductCode: "",
      cylinderCode: "", // Initialize with empty string
      materialWeb: "",
    },
  });

  const [plateFolderNumber, setPlateFolderNumber] = useState<string>("");
  const [dieNumbers, setDieNumbers] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRawMaterial, setSelectedRawMaterial] = useState("");
  const [selectedDieType, setSelectedDieType] = useState("");
  const [selectedCylinderCode, setSelectedCylinderCode] = useState("");
  const [rawMaterialDesc, setRawMaterialDesc] = useState("");
  const [materialWeb, setMaterialWeb] = useState("");
  const [numColors, setNumColors] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const token = Cookies.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [serialNo, setSerialNo] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isMetric, setIsMetric] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  /**
  |--------------------------------------------------
  | --------------------------this is to my new code for job card printing 
  |--------------------------------------------------
  */
  const [soDT, setSODT] = useState<Date | undefined>(undefined);
  const [jobbcardDate, setJobbcardDate] = useState<Date | undefined>(undefined);
  const [shift, setShift] = useState<string>("");
  const [soNo, setSoNo] = useState("");
  
  const [jcNumber, setJcNumber] = useState("");
  const [jcNumberOption, setJcNumberOption] = useState<CustomDropdownOptions[]>(
    []
  );
  const [jcDescription, setJcDescription] = useState("");
  const [jcDescriptionOption, setJcDescriptionOption] = useState<
    CustomDropdownOptions[]
  >([]);
  const [jcAllData, setJCAllData] = useState<any>("");
  const [quantity, setQuantity] = useState<string>("");
  const [metarsOfRuns, setMetarsOfRuns] = useState("");
  const [operator, setOperator] = useState("");
  const [upAcross, setUpAcross] = useState("");
  const [remarks, setRemarks] = useState("");

  // --------------------------------- punching --------------------------------
  const [machinePunching, setMachinePunching] = useState("");
  const [operatorOne, setOperatorOne] = useState("");
  const [totalImpressions, setTotalImpressions] = useState("");

  const [remarksOne, setRemarksOne] = useState("");

  // --------------------------------- Slitting/Finishing --------------------------------
  // const [jobbcardDateFinishing, setJobbcardDateFinishing] = useState<Date | undefined>(undefined);
  const [operatorFinishing, setOperatorFinishing] = useState("");
  // const [shiftFinishing, setShiftFinishing] = useState<string>("");
  // const [machineFinsishing, setMachineFinishing] = useState("");
  const [noOfRolls, setNumberOfRolls] = useState<number | null>(null);
  const [labelPerRoll, setLabelPerRoll] = useState("");
  const [coreSize, setCoreSize] = useState("");
  const [windingDirection, setWindingDirection] = useState("");
  const [noOfLabelProduced, setNoOfLabelProduced] = useState("");
  const [wastage, setWastage] = useState("");
  const [remarksEnd, setRemarksEnd] = useState("");
  const [numberOfLabels, setNumberOfLabels] = useState<string>("");

  const [generatorJCNO, setGeneratorJCNO] = useState("");


  const [jcDescriptionErr, setJcDescriptionErr] = useState(false)
  const [QuantityErr, setQuantityErr] = useState(false)
  const [jobCardDateErr, setJobCardDateErr] = useState(false);

  /**
  |--------------------------------------------------
  | --------------------------this is to my new code for job card printing------------------------------
  |--------------------------------------------------
  */

  const selectedLabelType = watch("labelType");
  const width = watch("width");
  const height = watch("height");
  const ups = watch("ups") || "";
  const core = watch("core") || "";
  const cut = watch("cut") || "";
  const perforation = watch("perforation") || "";
  

  const isStepCompleted = (step: number) => completedSteps.includes(step);

  const shouldShowStep = (step: number) =>
    step === activeStep || isStepCompleted(step);

  const validateColors = (): boolean => {
    if (selectedLabelType === "PP" && numColors > 0) {
      const colors = watch("colors") || [];
      for (let i = 0; i < numColors; i++) {
        const color = colors[i];
        if (!color || !color.color || !color.anilox || !color.bcm) {
          toast({
            variant: "destructive",
            title: "Color Validation Error",
            description: `Please fill in all details for Color ${i + 1}`,
          });
          return false;
        }
      }
    }
    return true;
  };

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



 let hasError = false;

    if (!jcNumber || jcNumber.trim() === "") {
      setJcDescriptionErr(true);
      hasError = true;
    } else {
      setJcDescriptionErr(false);
    }

    if (!quantity || quantity.trim() === "" || isNaN(Number(quantity))) {
      setQuantityErr(true);
      hasError = true;
    } else {
      setQuantityErr(false);
    }

    if (!jobbcardDate) {
      setJobCardDateErr(true);
      hasError = true;
    } else {
      setJobCardDateErr(false);
    }

    if (hasError) {
      toast({
        variant: "destructive",
        title: "Plz Fill Required !!!!!",
        description: "Please select or enter a valid Input.",
      });
      return;
    }



    if (selectedLabelType === "PP" && step === 3) {
      if (!validateColors()) return;
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

    Promise.all([getJcNumber(), generateJobCardNumber()]).finally(() =>
      setIsLoading(false)
    );
  }, []);

  useEffect(() => {
    const quantityNum = Number(quantity);
    const labelsNum = Number(numberOfLabels);

    // Validate inputs
    if (
      !isNaN(quantityNum) &&
      !isNaN(labelsNum) &&
      labelsNum > 0 // Prevent division by zero
    ) {
      const result = quantityNum / labelsNum;
      setNumberOfRolls(result);
    } else {
      setNumberOfRolls(null); // Reset if inputs are invalid
    }
  }, [quantity, numberOfLabels]);

  // ------------------------------this is to Genrated Job Card Number--------------------------------
  const generateJobCardNumber = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/getWorkOrderSrNo`
      );
      const data = response.data.result[0];
      setGeneratorJCNO(data.SrNo);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch company name" });
    }
  };

  const getJcNumber = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-all-jc-Number`
      );
      const data: { JobDescription: string }[] = response.data.result;
      setJcNumberOption(
        data.map((item) => ({
          value: item.JobDescription,
          label: item.JobDescription,
        }))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch job card number",
      });
    }
  };

  const getJcDescription = async (jobNumber: string) => {
    if (!jobNumber) return;

    try {
      const dataValue = {
        JobCardNumber: jobNumber,
      };
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-all-jc-Description`,
        dataValue
      );
      const data: { JobDescription: string }[] = response.data.result;
      setJcDescriptionOption(
        data.map((item) => ({
          value: item.JobDescription,
          label: item.JobDescription,
        }))
      );

      // this is to new code for set data 

      const res = response.data.result[0];
      setJCAllData(res);

      setMaterialWeb(res.MaterialWeb ? res.MaterialWeb : "");
      setUpAcross(res.UpsAcross ? res.UpsAcross : "");
      setNumberOfLabels(res.NumberOfLabel ? res.NumberOfLabel : "");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch job card description",
      });
    }
  };

  // const getAllJobCardData = async (jc: string, jcDescription: string) => {
  //   if (!jc || !jcDescription) return;
  //   try {
  //     const valueData = {
  //       JobCardNumber: jc,
  //       JobDescription: jcDescription,
  //     };
  //     const response = await axios.post(
  //       `${BACKEND_URL}/api/master/getAllJobCardData`,
  //       valueData
  //     );
  //     const res = response.data.result[0];
  //     setJCAllData(res);

  //     setMaterialWeb(res.MaterialWeb ? res.MaterialWeb : "");
  //     setUpAcross(res.UpsAcross ? res.UpsAcross : "");
  //     setNumberOfLabels(res.NumberOfLabel ? res.NumberOfLabel : "");
  //   } catch (error) {
  //     toast({ variant: "destructive", title: "Failed to fetch company name" });
  //   }
  // };

  const handleJcNumberChange = (value: string) => {
    setJcNumber(value);
    getJcDescription(value);
    setValue("jcNumber", value);
    setJcDescription("");
  };

  const handleJcDescriptionChange = (value: string) => {
    setJcDescription(value);
    setValue("jcDescription", value);
    // getAllJobCardData(jcNumber, value);
    setQuantity("");
    setMetarsOfRuns("");
  };

  const handleJobDateChange = (value: Date | undefined) => {
    setJobbcardDate(value);
    setValue("jobDate", value);
  };

  // ----------------------One sirise----------

  // ----------- Finishinng -----------------

  const calculateMetarsOfRuns = (
    quantity: string,
    jcAllData: JcAllData
  ): string => {
    const qty = parseFloat(quantity) || 0;
    // Convert ColorNo to number to ensure correct switch comparison
    let colorNo = parseInt(jcAllData.ColorNo as any, 10) || 0;
    // console.log('Manually set ColorNo:', colorNo);

    let colorvalue: number;
    switch (colorNo) {
      case 0:
        colorvalue = 0.2; // 2%
        break;
      case 1:
        colorvalue = 0.5; // 5%
        break;
      case 2:
        colorvalue = 0.6; // 6%
        break;
      case 3:
        colorvalue = 0.7; // 7%
        break;
      case 4:
        colorvalue = 0.8; // 8%
        break;
      case 5:
        colorvalue = 0.9; // 9%
        break;
      case 6:
        colorvalue = 1.0; // 10%
        break;
      case 7:
        colorvalue = 1.1; // 11%
        break;
      case 8:
        colorvalue = 1.2; // 12%
        break;
      case 9:
        colorvalue = 1.3; // 13%
        break;
      default:
        colorvalue = 0;
    }

    // console.log('Assigned colorvalue:', colorvalue);
    // console.log('this is to ', colorvalue);

    const result =
      (qty * jcAllData.CylinderCode * 3.175) /
        jcAllData.UpsAcross /
        jcAllData.UpsAlong /
        1000 +
      colorvalue;

    // console.log(result)
    return result.toFixed(2); // String with 2 decimal places
  };

  const handleCustomValueChange =
    (field: keyof JobCardControlSchema) => (value: string) => {
      setValue(field, value);
      switch (field) {
        case "company":
          setSelectedCompany(value);
          // setAddresses([]);
          break;
        case "rawMaterial":
          setSelectedRawMaterial(value);
          setRawMaterialDesc("Custom material");
          break;
        case "dieType":
          setSelectedDieType(value);
          setDieNumbers([]);
          break;
        case "cylinderCode":
          setSelectedCylinderCode(value);
          break;
      }
    };

  //  console.log('JC ALL DATA',jcAllData)

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<JobCardControlSchema | null>(null);

  // console.log(formData)

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "oldProductCode") {
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const [oldProductCodeValue, setOldProductCodeValue] = useState<string>("");

  // console.log(formData)

  const onSubmitForm = (data: JobCardControlSchema) => {
    try {
      const processedData = {
        ...data,
        width: data.width?.toString() || "",
        height: data.height?.toString() || "",
        dieNumber: data.dieNumber || undefined,
        oldProductCode: data.oldProductCode || oldProductCodeValue || "",
        ups: data.ups?.toString() || "",
        machines: data.machines || "",
        cylinderCode: data.cylinderCode || selectedCylinderCode || "", // Ensure cylinder code is included
      };

      setFormData(processedData);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Form Processing Error",
        description: "Could not process form data",
      });
    }
  };

  const submitToApi = async () => {
    if (!formData) return;
  
    try {
      toast({
        title: "Processing...",
        description: "Saving job control details",
      });
  
      setIsDialogOpen(false);
  
      // Create a JSON object instead of FormData
      const payload = {
        WorkOrderNo: generatorJCNO || "",
        SONo: soNo || "",
        SODate: soDT || "",
        Date: jobbcardDate?.toLocaleDateString() || "",
        Shift: shift || "",
        JobDescription: jcNumber || "",
        JobCardNumber: jcAllData.JobCardNumber || "",
        LabelSize: jcAllData.Width && jcAllData.Height && jcAllData.Unit ? `${jcAllData.Width}×${jcAllData.Height}${jcAllData.Unit}` : "",
        WindingDirection: jcAllData.WindingDirection || "",
        MatDesc: jcAllData.MatDesc || "",
        MaterialWeb: materialWeb || "",
        CylinderCode: jcAllData.CylinderCode || "",
        UpsAcross: upAcross || "",
        UpsAlong: jcAllData.UpsAlong || "",
        GapAcross: jcAllData.GapAcross || "",
        GapAlong: jcAllData.GapAlong || "",
        Quantity: quantity || "",
        MetersOfRuns: metarsOfRuns || "",
        DieType: jcAllData.DieType || "",
        DieNumber: jcAllData.DieNumber || "",
        LaminationMaterial: jcAllData.LaminationMaterial || "",
        FoilMaterialCode: jcAllData.FoilMaterialCode || "",
        ThermalPrintingRequired: jcAllData.ThermalPrintingRequired || "",
        RibbonType: jcAllData.RibbonType || "",
        Machine: jcAllData.Machine || "",
        Operator: operator || "",
        SettingStartTime: "",
        SettingEndTime: "",
        ProductionStartTime: "",
        ProductionEndTime: "",
        TotalMetersProduced: "",
        Remarks: remarks || "",
        Date2: jobbcardDate?.toLocaleDateString() || "",
        Shift2: shift || "",
        Operator2: operatorOne || "",
        SettingStartTime2: "",
        SettingEndTime2: "",
        ProductionStartTime2: "",
        ProductionEndTime2: "",
        TotalImpressions: totalImpressions || "",
        Remarks2: remarksOne || "",
        Date3: jobbcardDate?.toLocaleDateString() || "",
        Shift3: shift || "",
        Operator3: operatorFinishing || "",
        NumberOfRolls: noOfRolls?.toString() ?? "",
        LabelPerRoll: numberOfLabels || "",
        Core: jcAllData.Core || "",
        SettingStartTime3: "",
        SettingEndTime3: "",
        ProductionStartTime3: "",
        ProductionEndTime3: "",
        NumberOfLabelProduced: "",
        NumberOfRollsProduced: "",
        Wastage: "",
        Remark3: remarksEnd || "",
        CreatedBy: getUserID() || "",
        ArtworkNo: jcAllData.ArtworkNo || "",
        PlateFolderNo: "",
      };
  
      const response = await axios.post(
        `${BACKEND_URL}/api/master/newJobCardMasterInsert`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Changed to JSON
          },
        }
      );
      const res = response.data.result[0];
  
      if (res.Status === "T") {
        toast({
          title: "Success!",
          description: res.Message || "Job control saved successfully",
          variant: "default",
        });
        generateJobCardNumber()
  
        handleReset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.Message || "Failed to save job control",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save job control",
      });
    }
  };

  const handleReset = () => {
    reset();
    setSelectedCompany("");
    setSoNo('')
    setSODT(undefined);
    // setAddresses([]);
    setSelectedRawMaterial("");
    setRawMaterialDesc("");
    setMaterialWeb("");
    setPlateFolderNumber("");
    setNumColors(1);
    setUploadedFiles([]);
    setSelectedDieType("");
    setDieNumbers([]);
    setActiveStep(1);
    setCompletedSteps([]);
    // ------------New data ------
    // ------------ Reset new data ------------
    setJobbcardDate(undefined);
    setShift("");
    setJcNumber("");
    setJcNumberOption([]);
    setJcDescription("");
    setJcDescriptionOption([]);
    setJCAllData("");
    setQuantity("");
    setMetarsOfRuns("");
    setOperator("");
    setUpAcross("");

    // Punching
    setMachinePunching("");
    setOperatorOne("");
    setTotalImpressions("");

    // Finishing / Slitting

    setOperatorFinishing("");

    setNumberOfRolls(0);
    setLabelPerRoll("");
    setCoreSize("");
    setWindingDirection("");
    setNoOfLabelProduced("");
    setWastage("");
    setNumberOfLabels("");


    getJcNumber();
    setJcDescriptionErr(false)
  };

  useEffect(() => {
    if (selectedLabelType) {
      fetchSerialNumber(selectedLabelType);
    }
  }, [selectedLabelType]);

  const fetchSerialNumber = async (labelType: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/get-serial-no-count`,
        { LabelType: labelType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSerialNo(response.data.SerialNo);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching serial number",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const generateJobNumber = () => {
    if (!selectedLabelType || !serialNo) return "";
    return `${selectedLabelType}${serialNo}`;
  };

  const generateSerialNumber = () => {
    if (!selectedLabelType || !serialNo) return "";

    let serialNumber = "";

    if (selectedLabelType === "PP") {
      serialNumber = `${numColors}${selectedLabelType}${serialNo}`;
    } else if (selectedLabelType === "PL") {
      serialNumber = `0${selectedLabelType}${serialNo}`;
    } else {
      serialNumber = `${selectedLabelType}${serialNo}`;
    }

    if (width && height) {
      serialNumber += `${width}.x${height}.0${isMetric ? "MM" : "IN"}`;
    }

    if (selectedRawMaterial) serialNumber += selectedRawMaterial;
    if (ups) serialNumber += ups;
    if (core) serialNumber += core;
    if (cut) serialNumber += cut === "yes" ? "Y" : "N";
    if (perforation) serialNumber += perforation === "yes" ? "Y" : "N";

    return serialNumber;
  };

  const jobNumber = selectedLabelType && serialNo ? generateJobNumber() : "";
  const fullSerialNumber =
    selectedLabelType && serialNo ? generateSerialNumber() : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading job control details...
          </p>
        </motion.div>
      </div>
    );
  }

  // Replace the simple confirmDialogContent with a more comprehensive JobCardPreviewDialog
  const JobCardPreviewDialog = () => {
    if (!formData) return null;
    // generateJobCardNumber();

    const printJobCard = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to print the job control",
          variant: "destructive",
        });
        return;
      }

      const printContent = document.getElementById("job-card-print-content");

      if (printContent) {
        const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 0.8cm;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 0;
              margin: 0;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
              border: 1px solid #000;
            }
            thead {
            background-color: #c6c0c0;
            }
            th, td {
              border: 2px solid #000;
              padding: 4px 6px;
              font-size: 10px;
            }
            td {
              font-weight: 400;
            }
            td:nth-child(odd) {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 20px;
              background-color: #f0f0f0;
              padding: 8px;
              margin-bottom: 4px;
            }
            .jc-number {
              color: #E53E3E;
              font-weight: bold;
            }
            .table-header {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .value-cell {
              font-weight: 600;
            }
              img {
              max-height: 40px; /* Adjust for print */
              width: auto;
              display: block;
              margin-left: auto;
              margin-bottom: 2px;
            }
            @media print {
              body { zoom: 100%; }
              table { border: 2px solid #000 !important; }
              th, td { border: 2px solid #000 !important; }
            }
          </style>
        `;

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Job Control Master - ${jobNumber || "Print"}</title>
            ${printStyles}
          </head>
          <body>
            <div class="print-container">
             <!-- <div class="header">JOB CONTROL MASTER</div> -->
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                // window.close();
              }
            </script>
          </body>
          </html>
        `);

        printWindow.document.close();
      }
    };

    // Color sequence for PP label type
    let colorTable: any[] = [];
    if (selectedLabelType === "PP" && formData.colors) {
      colorTable = formData.colors.slice(0, numColors).map((c, index) => ({
        ColorNo: (index + 1).toString(),
        Color: c?.color || "",
        Anilox: c?.anilox || "",
        BCM: c?.bcm || "",
      }));
    }

    // Function to handle file icon display
    const getFileIcon = (fileName: string) => {
      const extension = fileName.split(".").pop()?.toLowerCase();
      switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
          return <Eye size={16} />;
        case "pdf":
          return <FaFilePdf size={16} className="text-red-500" />;
        case "xls":
        case "xlsx":
          return <FaFileExcel size={16} className="text-green-500" />;
        default:
          return <Eye size={16} />;
      }
    };

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Job Card Preview - {generatorJCNO}
          </DialogTitle>
        </DialogHeader>

        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div id="job-card-print-content" className="border border-gray-800">
            <div className="flex justify-end mb-4">
              BARTECH DATA SYSTEM PVT. LTD.
              <img
                src="/images/bartech.png"
                alt="Bartech Logo"
                className="h-16 w-auto"
              />
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-start"
                    colSpan={2}
                  >
                    Job Card NO: {generatorJCNO}
                  </th>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-start"
                    colSpan={4}
                  >
                    Job Card Date:{" "}
                    {jobbcardDate ? jobbcardDate.toLocaleDateString() : ""}
                  </th>
                </tr>
              </thead>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Printing
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row with 4 columns, extended to 6 */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jobbcardDate ? jobbcardDate.toLocaleDateString() : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {shift ? shift : ""}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                   SO NO
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {soNo ? soNo : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    SO DT
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    
                  >
                    {soDT ? soDT.toLocaleDateString() : ""} 
                  </td>
                </tr>

                {/* Row with mix of widths, normalized to 6 columns */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.JobCardNumber ? jcAllData.JobCardNumber : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control Desc.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.JobDescription
                      ? jcAllData.JobDescription
                      : "No Job Description"}
                  </td>
                </tr>

               


                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Label Size
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.Width}
                    {jcAllData && "×"}
                    {jcAllData.Height} {jcAllData.Unit}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Art Work No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.ArtworkNo}
                  </td>
                 
                </tr>
                

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Material Description
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.MatDesc}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Material Web
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {materialWeb ? materialWeb : ""}
                  </td>
                </tr>

                {/* This is already a 6-column row, keep as is */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Cylinder
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.CylinderCode}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Ups Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {upAcross ? upAcross : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Up Along
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.UpsAlong ? jcAllData.UpsAlong : ""}
                  </td>
                </tr>

                {/* Convert 4-column row to 6-column */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Gap Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.GapAcross ? jcAllData.GapAcross : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Gap Along
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.GapAlong ? jcAllData.GapAlong : "No GapAlong"}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Quantity
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {quantity}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Meters Of Runs
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {metarsOfRuns}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Die Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.DieType}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Die No.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.DieNumber}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Lamination Material Varnish
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.LaminationMaterial}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Foil
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.FoilMaterialCode}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Thermal Printing
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.ThermalPrintingRequired}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Ribbon
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.RibbonType}
                  </td>
                </tr>

                {/* Row with 4 columns, extended to 6 */}
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.Machine}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {operator ? operator : ""}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Total Meters Producd
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  ></td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {remarks ? remarks : ""}
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Punching
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jobbcardDate ? jobbcardDate.toLocaleDateString() : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {shift ? shift : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.JobCardNumber ? jcAllData.JobCardNumber : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Job Control Desc.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/2 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.JobDescription
                      ? jcAllData.JobDescription
                      : "No Job Description"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Label Size
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.Width}
                    {jcAllData && "×"}
                    {jcAllData.Height} {jcAllData.Unit}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Winding Direction
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    <img
                      className="winding-image"
                      src={getWindingImagePath(jcAllData.WindingDirection)}
                      alt="Winding Image"
                  />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {machinePunching}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {operatorOne ? operatorOne : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Total Impressoins
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {totalImpressions}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {remarksOne ? remarksOne : ""}
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th
                    className="border border-gray-800 font-bold px-2 py-1 text-center"
                    colSpan={6}
                  >
                    Slitting/Finishing
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Date
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jobbcardDate ? jobbcardDate.toLocaleDateString() : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Shift
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {shift ? shift : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Machine No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.Machine}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {operatorFinishing}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Rolls
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {noOfRolls ? noOfRolls : ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Lables Per roll
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {numberOfLabels ? numberOfLabels : ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Core Die
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {jcAllData.Core}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Winding Direction
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {windingDirection}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Setting End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production Start Time
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Production End Time
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>

                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Lables Produced
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    No Of Rolls Produced
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  ></td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Wastage %
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold"></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Art Work No.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {jcAllData.ArtworkNo}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    QC Sign
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">
                    {}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Operator Sign
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 w-1/6 font-semibold"
                    colSpan={3}
                  >
                    {}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">
                    Remarks:
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={5}
                  >
                    {remarksEnd ? remarksEnd : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Document attachments section */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Attachments</h3>
              <div className="overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {uploadedFiles.map((file, index) => {
                    const fileName = file.name;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 rounded border border-gray-300"
                      >
                        {getFileIcon(fileName)}
                        <span className="max-w-[150px] truncate">
                          {fileName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between mt-4 gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={printJobCard}
              className="flex items-center gap-2"
              disabled={isSubmitting}
            >
              <Printer size={16} /> Print Preview
            </Button>
          </div>
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
          {/* Enhanced Floating Header */}
          {selectedLabelType && serialNo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-0 z-10 w-full bg-gradient-to-r from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30 backdrop-blur-sm border border-rose-200 dark:border-rose-900 shadow-sm py-4 px-5 mb-6 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                    Job Number:
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-200">
                    {jobNumber}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                    Serial Number:
                  </span>
                  <span className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-200">
                    {fullSerialNumber}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Step 1: printing Card */}
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
                    Step 1: Printing
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                           <div className="space-y-2">
                              <Label>Job Card Number</Label>
                              <Input
                                value={generatorJCNO || ''}
                                placeholder="Job Card Number"
                                disabled
                              />
                            </div>
                          <div className="space-y-2">
                            <Label className={jobCardDateErr ? "text-destructive" : ""}>Date  </Label><span className="text-destructive">*</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !jobbcardDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {jobbcardDate ? (
                                    format(jobbcardDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={jobbcardDate}
                                  // onSelect={(date) => setJobbcardDate(date || new Date())}
                                  onSelect={handleJobDateChange}
                                  initialFocus
                                />
                              </PopoverContent>
                              {jobCardDateErr && (
                              <p className="text-sm text-red-500 mt-1 ml-1">Job Card Date is required !!!</p>
                            )}
                            </Popover>
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.soNO ? "text-destructive" : ""
                              }
                            >
                              SO NO. 
                            </Label>
                            <Input
                              type="text"
                              value={soNo}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setSoNo(newValue);
                                setValue("soNO", newValue);
                                
                              }}
                              placeholder="Enter SO NO"
                              
                            />
                            {errors.soNO && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.soNO.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                         
                            <DateTimePicker
                                label="SO DT"
                                value={soDT}
                                onChange={(date) => setSODT(date)}
                              />
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.jcNumber || jcDescriptionErr ? "text-destructive" : ""
                              }
                            >
                              Job Control Description  <span className="text-destructive">*</span>
                            </Label>
                            <CustomDropdown
                              options={jcNumberOption}
                              value={jcNumber}
                              onValueChange={handleJcNumberChange}
                              placeholder="Select Job Control Description"
                              searchPlaceholder="Search JC Description..."
                              emptyText="No JC Description found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange(
                                "jcNumber"
                              )}
                              
                            />
                            {(errors.jcNumber || jcDescriptionErr) && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.jcNumber?.message  || `Plz Select the Dropdown !!!`}
                              </motion.p>
                            )}
                          </div>
                          

                          <div className="space-y-2">
                            <Label>Job Control Number</Label>
                            <Input
                              value={jcAllData.JobCardNumber ? jcAllData.JobCardNumber : ''}
                              // onChange={(e) => setJcDescription(e.target.value)}
                              placeholder="Enter Job Control Number"
                              disabled
                            />
                          
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="Status"
                              className={errors.Shift ? "text-destructive" : ""}
                            >
                              Shift 
                            </Label>
                            <Select
                              value={shift}
                              onValueChange={(e) => {
                                setShift(e), setValue("Shift", e);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Shift" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="G">G</SelectItem>
                              </SelectContent>
                            </Select>

                            {errors.Shift && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.Shift.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                (errors.Quantity || QuantityErr ) ? "text-destructive" : ""
                              }
                            >
                              Quantity  <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setQuantity(newValue);
                                setValue("Quantity", newValue);
                                const calculatedMetars = calculateMetarsOfRuns(
                                  newValue,
                                  jcAllData
                                );
                                setMetarsOfRuns(calculatedMetars);
                              }}
                              placeholder="Enter Quantity"
                              disabled={!jcAllData}
                            />
                            {QuantityErr && (
                              <p className="text-sm text-red-500 mt-1 ml-1">Quantity is required !!!</p>
                            )}
                          </div>

                         
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.Quantity ? "text-destructive" : ""
                              }
                            >
                              Meters Of Runs
                            </Label>
                            <Input
                              type="number"
                              value={metarsOfRuns}
                              onChange={(e) => {
                                setMetarsOfRuns(e.target.value);
                                setValue("MetersOfRuns", e.target.value);
                              }}
                              placeholder="Enter Meters Of Runs"
                              disabled
                            />
                            {errors.Quantity && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.Quantity.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.materialWeb ? "text-destructive" : ""
                              }
                            >
                              Material Web 
                            </Label>
                            <Input
                              type="text"
                              value={materialWeb}
                              onChange={(e) => {
                                setMaterialWeb(e.target.value);
                                setValue("materialWeb", e.target.value);
                              }}
                              // placeholder="Enter Material Web"
                            />
                            {errors.materialWeb && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.materialWeb.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.upsAcross ? "text-destructive" : ""
                              }
                            >
                              Ups Across 
                            </Label>
                            <Input
                              type="text"
                              value={upAcross}
                              onChange={(e) => {
                                setUpAcross(e.target.value);
                                setValue("upsAcross", e.target.value);
                              }}
                              // placeholder="Enter Material Web"
                            />
                            {errors.upsAcross && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.upsAcross.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.Operator ? "text-destructive" : ""
                              }
                            >
                              Operator 
                            </Label>
                            <Input
                              type="text"
                              value={operator}
                              onChange={(e) => {
                                setOperator(e.target.value);
                                setValue("Operator", e.target.value);
                              }}
                              placeholder="Enter Operator"
                            />
                            {errors.Operator && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.Operator.message}
                              </motion.p>
                            )}
                          </div>
                          {/* Remarks */}
                          <div className="space-y-2">
                            <Label>Remarks </Label>
                            <Input
                              type="text"
                              value={remarks}
                              onChange={(e) => {
                                setRemarks(e.target.value);
                              }}
                              placeholder="Enter Remarks"
                            />
                          </div>
                          {jcAllData && (
                            <>
                              <div className="space-y-2">
                                <Label>Label Width</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Width
                                      ? jcAllData.Width
                                      : ""
                                  }
                                  placeholder="Label Width"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Height</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Height
                                      ? jcAllData.Height
                                      : ""
                                  }
                                  placeholder="Label Height"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Unit</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Unit
                                      ? jcAllData.Unit
                                      : ""
                                  }
                                  placeholder="Label Unit"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Winding Direction</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.WindingDirection
                                      ? jcAllData.WindingDirection
                                      : ""
                                  }
                                  placeholder="Winding Direction"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Unit</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Unit
                                      ? jcAllData.Unit
                                      : ""
                                  }
                                  placeholder="Label Unit"
                                  disabled
                                />
                              </div>


                              {/* ------------------------------------------ */}

                              <div className="space-y-2">
                                <Label>Material Description</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.MatDesc
                                      ? jcAllData.MatDesc
                                      : ""
                                  }
                                  placeholder="Material Description"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Cylinder Code</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.CylinderCode
                                      ? jcAllData.CylinderCode
                                      : ""
                                  }
                                  placeholder="Cylinder Code"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Up Along</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.UpsAlong 
                                      ? jcAllData.UpsAlong 
                                      : ""
                                  }
                                  placeholder="Up Along"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Gap Across</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.GapAcross 
                                      ? jcAllData.GapAcross 
                                      : ""
                                  }
                                  placeholder="Gap Across"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Die Type</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.DieType 
                                      ? jcAllData.DieType 
                                      : ""
                                  }
                                  placeholder="Die Type"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Lamination Material/Varnish</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.LaminationMaterial
                                      ? jcAllData.LaminationMaterial
                                      : ""
                                  }
                                  placeholder="Lamination Material/Varnish"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Foil</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.FoilMaterialCode
                                      ? jcAllData.FoilMaterialCode
                                      : ""
                                  }
                                  placeholder="Foil"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Machine No.</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Machine
                                      ? jcAllData.Machine
                                      : ""
                                  }
                                  placeholder="Machine No."
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Art work No</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.ArtworkNo
                                      ? jcAllData.ArtworkNo
                                      : ""
                                  }
                                  placeholder="Art work No"
                                  disabled
                                />
                              </div>
                              
                            </>
                          )}
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={() =>
                              goToNextStep(1, [
                                "jobDate",
                                "jcNumber",
                                "jcDescription",
                                "Quantity",
                                "MetersOfRuns",
                                "Operator",
                                "settingStartTime",
                                "settingEndTime",
                                "productionStartTime",
                                "productionEndTime",
                              ])
                            }
                            // onClick={() => goToNextStep(1, [])}
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

            {/* Step 2: Label Type Card */}
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
                    Step 2: Punching
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.operatorOne ? "text-destructive" : ""
                              }
                            >
                              Operator
                            </Label>
                            <Input
                              type="text"
                              value={operatorOne}
                              onChange={(e) => {
                                setOperatorOne(e.target.value);
                                setValue("operatorOne", e.target.value);
                              }}
                              placeholder="Enter Operator"
                            />
                            {errors.operatorOne && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.operatorOne.message}
                              </motion.p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Remarks</Label>
                            <Input
                              type="text"
                              value={remarksOne}
                              onChange={(e) => {
                                setRemarksOne(e.target.value);
                              }}
                              placeholder="Enter Remarks"
                            />
                          </div>

                          {jcAllData && (
                            <>
                            <div className="space-y-2">
                                <Label>Shift</Label>
                                <Input
                                  type="text"
                                  value={
                                    shift
                                      ? shift
                                      : ""
                                  }
                                  placeholder="Shift"
                                  disabled
                                />
                              </div>
                             <div className="space-y-2">
                                <Label>Job Card Number</Label>
                                <Input
                                  type="text"
                                  value={
                                    generatorJCNO
                                      ? generatorJCNO
                                      : ""
                                  }
                                  placeholder="JC Number"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Job Control Description </Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.JobDescription
                                      ? jcAllData.JobDescription
                                      : ""
                                  }
                                  placeholder="JC Description "
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Job Control Number</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.JobCardNumber
                                      ? jcAllData.JobCardNumber
                                      : ""
                                  }
                                  placeholder="JC Number"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Width</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Width
                                      ? jcAllData.Width
                                      : ""
                                  }
                                  placeholder="Label Width"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Height</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Height
                                      ? jcAllData.Height
                                      : ""
                                  }
                                  placeholder="Label Height"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Unit</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Unit
                                      ? jcAllData.Unit
                                      : ""
                                  }
                                  placeholder="Label Unit"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Winding Direction</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.WindingDirection
                                      ? jcAllData.WindingDirection
                                      : ""
                                  }
                                  placeholder="Winding Direction"
                                  disabled
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Label Unit</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Unit
                                      ? jcAllData.Unit
                                      : ""
                                  }
                                  placeholder="Label Unit"
                                  disabled
                                />
                              </div>


                              {/* ------------------------------------------ */}

                              <div className="space-y-2">
                                <Label>Material Description</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.MatDesc
                                      ? jcAllData.MatDesc
                                      : ""
                                  }
                                  placeholder="Material Description"
                                  disabled
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Cylinder Code</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.CylinderCode
                                      ? jcAllData.CylinderCode
                                      : ""
                                  }
                                  placeholder="Cylinder Code"
                                  disabled
                                />
                                 
                              </div>

                              <div className="space-y-2">
                                <Label>Machine No.</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Machine
                                      ? jcAllData.Machine
                                      : ""
                                  }
                                  placeholder="Machine No."
                                  disabled
                                />
                              </div>
                              
                            </>
                          )}
                        </div>
                        <div className="flex justify-between pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => goToPreviousStep(2)}
                          >
                            <ChevronUp className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button
                            type="button"
                            onClick={() => goToNextStep(2, [])}
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

            {/* Step 5: Additional Details */}
            <motion.div
              animate={{
                opacity:
                  activeStep === (selectedLabelType === "PP" ? 4 : 3) ||
                  completedSteps.includes(selectedLabelType === "PP" ? 4 : 3)
                    ? 1
                    : 0.7,
                scale:
                  activeStep === (selectedLabelType === "PP" ? 4 : 3)
                    ? 1
                    : 0.99,
              }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={
                  isStepCompleted(selectedLabelType === "PP" ? 5 : 4)
                    ? "border-green-500 dark:border-green-700 border-2"
                    : ""
                }
              >
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${
                    (activeStep !== (selectedLabelType === "PP" ? 4 : 3) &&
                      isStepCompleted(selectedLabelType === "PP" ? 4 : 3)) ||
                    activeStep > (selectedLabelType === "PP" ? 4 : 3)
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={() => {
                    if (
                      isStepCompleted(selectedLabelType === "PP" ? 4 : 3) &&
                      activeStep !== (selectedLabelType === "PP" ? 4 : 3)
                    ) {
                      setActiveStep(selectedLabelType === "PP" ? 4 : 3);
                    } else if (
                      activeStep > (selectedLabelType === "PP" ? 4 : 3)
                    ) {
                      setActiveStep(selectedLabelType === "PP" ? 4 : 3);
                    }
                  }}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step {selectedLabelType === "PP" ? "4" : "3"}: Slitting /
                    Finishing
                    {isStepCompleted(selectedLabelType === "PP" ? 4 : 3) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(selectedLabelType === "PP" ? 4 : 3) &&
                    activeStep !== (selectedLabelType === "PP" ? 4 : 3) && (
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                </CardHeader>
                <AnimatePresence>
                  {activeStep === (selectedLabelType === "PP" ? 4 : 3) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label
                              className={
                                errors.Operator ? "text-destructive" : ""
                              }
                            >
                              Operator
                            </Label>
                            <Input
                              type="text"
                              value={operatorFinishing}
                              onChange={(e) => {
                                setOperatorFinishing(e.target.value);
                                setValue("Operator", e.target.value);
                              }}
                              placeholder="Enter Operator"
                            />
                            {errors.Operator && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.Operator.message}
                              </motion.p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Remarks</Label>
                            <Input
                              type="text"
                              value={remarksEnd}
                              onChange={(e) => {
                                setRemarksEnd(e.target.value);
                              }}
                              placeholder="Enter Remarks"
                            />
                          </div>

                          {jcAllData && (
                            <>
                            <div className="space-y-2">
                                <Label>No Of Rolls</Label>
                                <Input
                                  type="text"
                                  value={
                                    noOfRolls
                                      ? noOfRolls
                                      : ""
                                  }
                                  placeholder="No Of Rolls"
                                  disabled
                                />
                              </div> 
                              <div className="space-y-2">
                                <Label>Lables Per roll</Label>
                                <Input
                                  type="text"
                                  value={
                                    numberOfLabels
                                      ? numberOfLabels
                                      : ""
                                  }
                                  placeholder="Lables Per roll"
                                  disabled
                                />
                              </div>

                             <div className="space-y-2">
                                <Label>Machine No.</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Machine
                                      ? jcAllData.Machine
                                      : ""
                                  }
                                  placeholder="Machine No."
                                  disabled
                                />
                              </div> 
                              <div className="space-y-2">
                                <Label>Core Die</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.Core
                                      ? jcAllData.Core
                                      : ""
                                  }
                                  placeholder="Core Die"
                                  disabled
                                />
                              </div>
                             
                              
                              
                             
                              <div className="space-y-2">
                                <Label>Winding Direction</Label>
                                <Input
                                  type="text"
                                  value={
                                    jcAllData.WindingDirection
                                      ? jcAllData.WindingDirection
                                      : ""
                                  }
                                  placeholder="Winding Direction"
                                  disabled
                                />
                              </div>
                              
                             
                              
                            </>
                          )}
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              goToPreviousStep(
                                selectedLabelType === "PP" ? 5 : 4
                              )
                            }
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
                              onClick={() => {
                                goToNextStep(4, []);
                              }}
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {" "}
                              {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              {isSubmitting ? "Saving..." : "Save Job Card"}
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
        <JobCardPreviewDialog />
      </Dialog>
    </>
  );
};

export default JobCard;
