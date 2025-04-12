"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import CustomDropdown from '../CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from "@/components/ui/use-toast";
import Cookies from 'js-cookie';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from '../multi-select';
import { zodResolver } from "@hookform/resolvers/zod";
// import { jobCardSchema, type JobCardSchema } from "./job-card-schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, CheckCircle, Eye, Printer, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import FileUpload from '../ui/file-upload';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { format, set } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import DateTimePicker from '@/utills/DateTimePickerProps';
import { jobCardControlSchema, type JobCardControlSchema  } from './job-card-controller-schema';
import { formatDateToDDMMYY } from '@/utills/dateUtils';

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
interface CustomerData {
  jobDate: string;
  JobCardNumber: string;
}

interface LabelTypeData {
  SrNo: number;
  LtypeCode: string;
  LtypeDes: string;
}

interface PaperTypeData {
  Lpapertypecode: string;
  LpapertypeDes: string;
}

interface RawMaterialData {
  RawMatCode: string;
  RawMatDes: string;
}

interface MachineData {
  SrNo: number;
  MachineCode: string;
  MachineDes: string;
  ProcessUsed: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}

interface DieData {
  SrNo: number;
  DieNo: string;
  DieType: string;
  DieDesc: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}
interface CylinderData {
  SrNo: number;
  CylinderCode: string;
  CylinderDesc: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}
const JobCard: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting }
  } = useForm<JobCardControlSchema>({
    resolver: zodResolver(jobCardControlSchema),
    defaultValues: {
      colors: Array(9).fill({ color: '', anilox: '', bcm: '' }),
      oldProductCode: '',
      cylinderCode: '', // Initialize with empty string
      materialWeb:''
    }
  });

  const [labelTypes, setLabelTypes] = useState<LabelTypeData[]>([]);
  const [plateFolderNumber, setPlateFolderNumber] = useState<string>("");
  const [rawMaterials, setRawMaterials] = useState<RawMaterialData[]>([]);
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [dieTypes, setDieTypes] = useState<string[]>([]);
  const [cylinderCode,setCylinderCode] = useState<string[]>([]);
  const [dieNumbers, setDieNumbers] = useState<string[]>([]);
  const [dieData, setDieData] = useState<DieData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRawMaterial, setSelectedRawMaterial] = useState("");
  const [selectedDieType, setSelectedDieType] = useState("");
  const[selectedCylinderCode,setSelectedCylinderCode] = useState("");
  const [rawMaterialDesc, setRawMaterialDesc] = useState("");
  const [materialWeb, setMaterialWeb] = useState("");
  const [numColors, setNumColors] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const token = Cookies.get('token');
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
  const [jobbcardDate, setJobbcardDate] = useState<Date | undefined>(undefined);
  const [shift, setShift] = useState<string>("");
  const [soNo, setSoNo] = useState<string>("");
  const [soDT, setSoDT] = useState<string>("");
  const [jcNumber, setJcNumber] = useState("");
  const [jcNumberOption, setJcNumberOption] = useState<CustomDropdownOptions[]>([]);
  const [jcDescription, setJcDescription] = useState("");
  const [jcDescriptionOption, setJcDescriptionOption] = useState<CustomDropdownOptions[]>([]);
  const [jcAllData, setJCAllData] = useState<any>("");
  const [jsAllDataOption, setJsAllDataOption] = useState<CustomDropdownOptions[]>([]);
  const [quantity, setQuantity] = useState("");
  const [metarsOfRuns, setMetarsOfRuns] = useState("");
  const [operator, setOperator] = useState("");
  const [settingStartTime, setSettingStartTime] = useState<Date | undefined>(undefined);
  const [settingEndTime, setSettingEndTime] = useState<Date | undefined>(undefined);
  const [productionStartTime, setProductionStartTime] = useState<Date | undefined>(undefined);
  const [productionEndTime, setProductionEndTime] = useState<Date | undefined>(undefined);
  // --------------------------------- punching --------------------------------
  const [jobbcardDatePunching, setJobbcardDatePunching] = useState<Date | undefined>(undefined);
  const [shiftPunching, setShiftPunching] = useState<string>("");
  const [machinePunching, setMachinePunching] = useState("");
  const [operatorOne, setOperatorOne] = useState("");
  const [settingStartTimeOne, setSettingStartTimeOne] = useState<Date | undefined>(undefined);
  const [settingEndTimeOne, setSettingEndTimeOne] = useState<Date | undefined>(undefined);
  const [productionStartTimeOne, setProductionStartTimeOne] = useState<Date | undefined>(undefined);
  const [productionEndTimeOne, setProductionEndTimeOne] = useState<Date | undefined>(undefined);
  const [totalImpressions, setTotalImpressions] = useState("");


  // --------------------------------- Slitting/Finishing --------------------------------
  const [jobbcardDateFinishing, setJobbcardDateFinishing] = useState<Date | undefined>(undefined);
  const [operatorFinishing, setOperatorFinishing] = useState("");
  const [shiftFinishing, setShiftFinishing] = useState<string>("");
  const [machineFinsishing, setMachineFinishing] = useState("");
  const [noOfRolls, setNumberOfRolls] = useState("");
  const [labelPerRoll, setLabelPerRoll] = useState("");
  const [coreSize , setCoreSize] = useState("");
  const [windingDirection, setWindingDirection] = useState("");
  const [noOfLabelProduced, setNoOfLabelProduced] = useState("");
  const [wastage, setWastage] = useState("");
  const [settingStartTimeFinishing, setSettingStartTimeFinishing] = useState<Date | undefined>(undefined);
  const [settingEndTimeFinishing, setSettingEndTimeFinishing] = useState<Date | undefined>(undefined);
  const [productionStartTimeFinishing, setProductionStartTimeFinishing] = useState<Date | undefined>(undefined);
  const [productionEndTimeFinishing, setProductionEndTimeFinishing] = useState<Date | undefined>(undefined);
  
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

  const shouldShowStep = (step: number) => step === activeStep || isStepCompleted(step);

  const validateColors = (): boolean => {
    if (selectedLabelType === 'PP' && numColors > 0) {
      const colors = watch('colors') || [];
      for (let i = 0; i < numColors; i++) {
        const color = colors[i];
        if (!color || !color.color || !color.anilox || !color.bcm) {
          toast({
            variant: "destructive",
            title: "Color Validation Error",
            description: `Please fill in all details for Color ${i + 1}`
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
          description: "Please fill in all required fields correctly before proceeding."
        });
        return;
      }
    }

    if (selectedLabelType === 'PP' && step === 3) {
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


    Promise.all([
      // fetchCustomers(),
      // fetchLabelTypes(),
      // fetchPaperTypes(),
      // fetchRawMaterials(),
      // fetchMachines(),
      // fetchCylinderData(),
      // fetchDieData()

      getJcNumber(),
    ]).finally(() => setIsLoading(false));
  }, []);

  const getJcNumber = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/master/get-all-jc-Number`);
      const data: { JobCardNumber: string }[] = response.data.result;
      setJcNumberOption(
        data.map((item) => ({ value: item.JobCardNumber, label: item.JobCardNumber }))
      );
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch job card number" });
    }
  };

  const getJcDescription = async (jobNumber: string) => {
    if(!jobNumber) return;
    
    try {
      const dataValue = {
        JobCardNumber: jobNumber
      }
      const response = await axios.post(`${BACKEND_URL}/api/master/get-all-jc-Description`, dataValue);
      const data: { JobDescription: string }[] = response.data.result;
      setJcDescriptionOption(
        data.map((item) => ({ value: item.JobDescription, label: item.JobDescription }))
      );
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch job card description" });
      }
};

const getAllJobCardData = async (jc:string, jcDescription:string) => {
  if(!jc || !jcDescription) return;
  try {
    const valueData ={
      JobCardNumber: jc,
      JobDescription: jcDescription
    
    }
    const response = await axios.post(`${BACKEND_URL}/api/master/getAllJobCardData`, valueData);
    const res = response.data.result[0];
    setJCAllData(res);
    
  } catch (error) {
    toast({ variant: 'destructive', title: "Failed to fetch company name" });
    }
  };

 


  const handleJcNumberChange = (value: string) => {
    setJcNumber(value);
    getJcDescription(value);
    setValue("jcNumber", value);
    setJcDescription('');
  };

  const handleJcDescriptionChange = (value: string) => {
    setJcDescription(value);
    setValue("jcDescription", value);
    getAllJobCardData(jcNumber, value);
    setQuantity('')
    setMetarsOfRuns('')
  };

  const handleJobDateChange = (value: Date | undefined) => {
    setJobbcardDate(value);
    setValue("jobDate", value);
  }
  const handleSettingStartTimeChange = (value: Date | undefined) => {
    setSettingStartTime(value);
    setValue("settingStartTime", value);
  }

  const handleSettingEndTimeChange = (value: Date | undefined) => {
    setSettingEndTime(value);
    setValue("settingEndTime", value);
  };

  const handleProductionStartTimeChange = (value: Date | undefined) => {
    setProductionStartTime(value);
    setValue("productionStartTime", value);
  };

  const handleProductionEndTimeChange = (value: Date | undefined) => {
    setProductionEndTime(value);
    setValue("productionEndTimeOne", value);
  };
// ----------------------One sirise----------
const handleJobDateChangePunching = (value: Date | undefined) => {
  setJobbcardDatePunching(value);
  setValue("jobbcardDatePunching", value);
}
const handleSettingStartTimeChangeOne = (value: Date | undefined) => {
  setSettingStartTimeOne(value);
  setValue("settingStartTime", value);
}

const handleSettingEndTimeChangeOne = (value: Date | undefined) => {
  setSettingEndTimeOne(value);
  setValue("settingEndTimeOne", value);
};

const handleProductionStartTimeChangeOne = (value: Date | undefined) => {
  setProductionStartTimeOne(value);
  setValue("productionStartTimeOne", value);
};

const handleProductionEndTimeChangeOne = (value: Date | undefined) => {
  setProductionEndTimeOne(value);
  setValue("productionEndTimeOne", value);
};
// ----------- Finishinng -----------------
const handleJobDateChangeFinishing =(value: Date | undefined) => {
  setJobbcardDateFinishing(value);
};



const calculateMetarsOfRuns = (quantity: string, jcAllData: JcAllData): string => {
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



  const handleCustomValueChange = (field: keyof JobCardControlSchema) => (value: string) => {
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
      if (name === 'oldProductCode') {
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
        cylinderCode: data.cylinderCode || selectedCylinderCode || "" // Ensure cylinder code is included
      };


      setFormData(processedData);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Form Processing Error",
        description: "Could not process form data"
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

      let colorTable: any[] = [];
      let colorSequence = "";
      let colorString = "";
      let aniloxString = "";
      let bcmString = "";

      if (selectedLabelType === 'PP' && formData.colors) {
        // Only take the needed colors based on numColors
        colorTable = formData.colors.slice(0, numColors).map((c, index) => ({
          ColorNo: (index + 1).toString(),
          Color: c?.color || "",
          Anilox: c?.anilox || "",
          BCM: c?.bcm || ""
        }));

        colorString = colorTable.map(c => c.Color).join('$');
        aniloxString = colorTable.map(c => c.Anilox).join('$');
        bcmString = colorTable.map(c => c.BCM).join('$');

        colorSequence = colorTable.map(c => c.ColorNo).join('$');
      }

      const formDataObj = new FormData();

      formDataObj.append('CompanyName', formData.company || "");
      formDataObj.append('CompanyAddress', formData.address || "");
      formDataObj.append('JobDescription', formData.jobDescription || "");
      formDataObj.append('LabelType', formData.labelType || "");
      formDataObj.append('PaperType', formData.paperType || "");
      formDataObj.append('Height', formData.height?.toString() || "");
      formDataObj.append('Width', formData.width?.toString() || "");
      formDataObj.append('Unit', isMetric ? "MM" : "IN");
      formDataObj.append('Ups', formData.ups || "");
      formDataObj.append('Core', formData.core || "");
      formDataObj.append('CutPerforation', `${formData.cut || ""}${formData.perforation || ""}`);
      formDataObj.append('MatCode', formData.rawMaterial || "");
      formDataObj.append('MatDesc', rawMaterialDesc || "");
      formDataObj.append('DieType', formData.dieType || "");
      formDataObj.append('DieNumber', formData.dieNumber?.toString() || "");
      formDataObj.append('LaminationMaterial', formData.laminationMaterial || "");
      formDataObj.append('FoilMaterialCode', formData.foilMaterialCode || "");
      formDataObj.append('MaterialWeb', materialWeb || "");
      formDataObj.append('SpecialCharacteristic', formData.specialCharacteristic || "");
      formDataObj.append('JobCardNumber', jobNumber || "");
      formDataObj.append('JcSerialNumber', fullSerialNumber || "");
      formDataObj.append('Machine', formData.machines || "");
      formDataObj.append('CreatedBy', username);
      formDataObj.append('ColorNo', numColors.toString());
      formDataObj.append('Color', selectedLabelType === 'PP' ? colorString : "");
      formDataObj.append('Anilox', selectedLabelType === 'PP' ? aniloxString : "");
      formDataObj.append('BCM', selectedLabelType === 'PP' ? bcmString : "");
      formDataObj.append('ColorSequence', colorSequence);
      formDataObj.append('CylinderCode', formData.cylinderCode || selectedCylinderCode || "");
      formDataObj.append('PlateFolderNo', plateFolderNumber || "");
      formDataObj.append('UpsAcross', formData.upsAcross || "");
      formDataObj.append('UpsAlong', formData.upsAlong || "");
      formDataObj.append('GapAcross', formData.gapAcross || "");
      formDataObj.append('GapAlong', formData.gapAlong || "");
      formDataObj.append('NumberOfLabel', formData.numberOfLabels || "");
      formDataObj.append('CustomerPartNumber', formData.customerPartNo || "");
      formDataObj.append('BlockNo', formData.blockNo || "");
      formDataObj.append('SupplyForm', formData.supplyForm || "");
      formDataObj.append('WindingDirection', formData.windingDirection || "");
      formDataObj.append('LabelDescription', "");
      formDataObj.append('OldProductCode', formData.oldProductCode || oldProductCodeValue || "");
      formDataObj.append('ThermalPrintingRequired', formData.thermalPrintingRequired || "");
      formDataObj.append('RibbonType', formData.ribbontype || "");
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formDataObj.append('files', file);
        });
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/master/in`,
        formDataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.Status === "T") {
        toast({
          title: "Success!",
          description: response.data.Message || "Job control saved successfully",
          variant: "default",
        });

        handleReset();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.data.Message || "Failed to save job control",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job control",
      });
    }
  };

 

  const handleReset = () => {
    reset();
    setSelectedCompany("");
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
  setSoNo("");
  setSoDT("");
  setJcNumber("");
  setJcNumberOption([]);
  setJcDescription("");
  setJcDescriptionOption([]);
  setJCAllData("");
  setJsAllDataOption([]);
  setQuantity("");
  setMetarsOfRuns("");
  setOperator("");
  setSettingStartTime(undefined);
  setSettingEndTime(undefined);
  setProductionStartTime(undefined);
  setProductionEndTime(undefined);

  // Punching
  setMachinePunching("");
  setOperatorOne("");
  setSettingStartTimeOne(undefined);
  setSettingEndTimeOne(undefined);
  setProductionStartTimeOne(undefined);
  setProductionEndTimeOne(undefined);
  setTotalImpressions("");

  // Finishing / Slitting
  setJobbcardDateFinishing(undefined);
  setOperatorFinishing("");
  setShiftFinishing("");
  setMachineFinishing("");
  setNumberOfRolls("");
  setLabelPerRoll("");
  setCoreSize("");
  setWindingDirection("");
  setNoOfLabelProduced("");
  setWastage("");
  setSettingStartTimeFinishing(undefined);
  setSettingEndTimeFinishing(undefined);
  setProductionStartTimeFinishing(undefined);
  setProductionEndTimeFinishing(undefined);

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
        variant: 'destructive',
        title: "Error fetching serial number",
        description: error instanceof Error ? error.message : "Unknown error occurred"
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
    if (cut) serialNumber += (cut === "yes" ? "Y" : "N");
    if (perforation) serialNumber += (perforation === "yes" ? "Y" : "N");

    return serialNumber;
  };

  const jobNumber = selectedLabelType && serialNo ? generateJobNumber() : "";
  const fullSerialNumber = selectedLabelType && serialNo ? generateSerialNumber() : "";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading job control details...</p>
        </motion.div>
      </div>
    );
  }



  // Replace the simple confirmDialogContent with a more comprehensive JobCardPreviewDialog
  const JobCardPreviewDialog = () => {
    if (!formData) return null;
    
    const printJobCard = () => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to print the job control",
          variant: "destructive",
        });
        return;
      }
      
      const printContent = document.getElementById('job-card-print-content');
      
      if (printContent) {
        const printStyles = `
          <style>
            @page {
              size: A4;
              margin: 1cm;
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
              border: 2px solid #000;
            }
            th, td {
              border: 2px solid #000;
              padding: 6px 8px;
              font-size: 10px;
            }
            td {
              font-weight: 500;
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
              padding: 10px;
              border-bottom: 2px solid #000;
              margin-bottom: 10px;
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
              max-height: 45px; /* Adjust for print */
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
            <title>Job Control Master - ${jobNumber || 'Print'}</title>
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
    if (selectedLabelType === 'PP' && formData.colors) {
      colorTable = formData.colors.slice(0, numColors).map((c, index) => ({
        ColorNo: (index + 1).toString(),
        Color: c?.color || "",
        Anilox: c?.anilox || "",
        BCM: c?.bcm || ""
      }));
    }

    // Function to handle file icon display
    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          return <Eye size={16} />;
        case 'pdf':
          return <FaFilePdf size={16} className="text-red-500" />;
        case 'xls':
        case 'xlsx':
          return <FaFileExcel size={16} className="text-green-500" />;
        default:
          return <Eye size={16} />;
      }
    };


   

    return (
      <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
          Job Control Preview - {jcAllData.JobCardNumber}
        </DialogTitle>
      </DialogHeader>
        
      <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div id="job-card-print-content" className="border border-gray-800">
        
        <div className="flex justify-end mb-4">
        BARTECH DATA SYSTEM PVT. LTD.
         <img src="/images/bartech.png" alt="Bartech Logo" className="h-16 w-auto" />
         </div>
          <table className="w-full border-collapse">
          <thead>
              <tr>
                <th className="border border-gray-800 font-bold px-2 py-1 text-start" colSpan={2}>
                  J.C NO: WRK00002
                </th>
                <th className="border border-gray-800 font-bold px-2 py-1 text-start" colSpan={4}>
                 J.C. DT: 12/12/2023
                </th>
              </tr>
            </thead>
            <thead>
              <tr>
                <th className="border border-gray-800 font-bold px-2 py-1 text-center" colSpan={6}>
                  Printing 
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row with 4 columns, extended to 6 */}
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Date</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jobbcardDate ? jobbcardDate.toLocaleDateString() : 'No date selected'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Shift</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{shift ? shift : 'No shift selected'}</td>
              </tr>
              
              {/* Row with mix of widths, normalized to 6 columns */}
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">JC Number</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcNumber ? jcNumber : 'No JC Number'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Job Description</td>
                <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>
                  {jcAllData.JobDescription ? jcAllData.JobDescription : 'No Job Description'}
                </td>
              </tr>
              
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Label Size</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.Width}{jcAllData && '×'}{jcAllData.Height} {jcAllData.Unit}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Winding Direction</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{jcAllData.WindingDirection}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Material Description</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.MatDesc}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Material Web</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{jcAllData.MaterialWeb ? jcAllData.MaterialWeb : 'No Material Web'}</td>
              </tr>

              {/* This is already a 6-column row, keep as is */}
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Cylinder</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.CylinderCode}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Ups Across</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.UpsAcross}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Up Along</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.UpsAlong ? jcAllData.UpsAlong : 'No UpsAlong'}</td>
              </tr>

              {/* Convert 4-column row to 6-column */}
              <tr>
              <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Gap Across</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.GapAcross ? jcAllData.GapAcross : 'No GapAcross'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Gap Along</td>
                <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>
                  {jcAllData.GapAlong ? jcAllData.GapAlong : 'No GapAlong'}
              </td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Quantity</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{quantity}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Meters Of Runs</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>
                    {metarsOfRuns}
                </td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Die Type</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.DieType}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Die No.</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>{jcAllData.DieNumber}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Lamination Material Varnish</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.LaminationMaterial}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Foil</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>{jcAllData.FoilMaterialCode}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Thermal Printing</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.ThermalPrintingRequired}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Ribbon</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>{jcAllData.RibbonType}</td>
              </tr>

              {/* Row with 4 columns, extended to 6 */}
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Machine No.</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcAllData.Machine}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{operator ? operator : 'No operator'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{settingStartTime ? formatDateToDDMMYY(settingStartTime.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{settingEndTime ? formatDateToDDMMYY(settingEndTime.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{productionStartTime ? formatDateToDDMMYY(productionStartTime.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{productionEndTime ? formatDateToDDMMYY(productionEndTime.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Total Meters Producd</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}></td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">QC Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Remarks:</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}></td>
              </tr>
              
              </tbody>
              <thead>
              <tr>
                <th className="border border-gray-800 font-bold px-2 py-1 text-center" colSpan={6}>
                  Punching
                </th>
              </tr>
            </thead>
            <tbody>
            <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Date</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Shift</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{}</td>
            </tr>
            <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">JC Number</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jcNumber ? jcNumber : 'No JC Number'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Job Description</td>
                <td className="border border-gray-800 px-2 py-1 w-1/2 font-semibold" colSpan={3}>
                  {jcAllData.JobDescription ? jcAllData.JobDescription : 'No Job Description'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Label Size</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Winding Direction</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Machine No.</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{machinePunching}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{operatorOne}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{settingStartTimeOne ? formatDateToDDMMYY(settingStartTimeOne.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{settingEndTimeOne ? formatDateToDDMMYY(settingEndTimeOne.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{productionStartTimeOne ? formatDateToDDMMYY(productionStartTimeOne.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{productionEndTimeOne ? formatDateToDDMMYY(productionEndTimeOne.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Total Impressoins</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}>{totalImpressions}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">QC Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Remarks:</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}></td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th className="border border-gray-800 font-bold px-2 py-1 text-center" colSpan={6}>
                  Slitting/Finishing
                </th>
              </tr>
            </thead>
            <tbody>
            <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Date</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{jobbcardDateFinishing ? jobbcardDateFinishing.toLocaleDateString() : 'No Date'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Shift</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{shiftFinishing}</td>
            </tr> 
            <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Machine No.</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{machineFinsishing}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{operatorFinishing}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">No Of Rolls</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{machineFinsishing}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Lables Per roll</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{noOfRolls}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Core Size</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{coreSize}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Winding Direction</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{windingDirection}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{settingStartTimeFinishing ? formatDateToDDMMYY(settingStartTimeFinishing.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Setting End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{settingEndTimeFinishing ? formatDateToDDMMYY(settingEndTimeFinishing.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production Start Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{productionStartTimeFinishing ? formatDateToDDMMYY(productionStartTimeFinishing.toLocaleString()) : 'No settingStartTime'}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Production End Time</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{productionEndTimeFinishing ? formatDateToDDMMYY(productionEndTimeFinishing.toLocaleString()) : 'No settingEndTime'}</td>
              </tr>

              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">No Of Lables Produced</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{noOfLabelProduced}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">No Of Rolls Produced</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{windingDirection}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Westage %</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}>{wastage}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">QC Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold">{}</td>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Operator Sign</td>
                <td className="border border-gray-800 px-2 py-1 w-1/6 font-semibold" colSpan={3}>{}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold px-2 py-1 w-1/6 bg-gray-100">Remarks:</td>
                <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={5}></td>
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
                        <span className="max-w-[150px] truncate">{fileName}</span>
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
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Job Number:</span>
                  <span className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-200">{jobNumber}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-400">Serial Number:</span>
                  <span className="text-base sm:text-lg font-semibold text-rose-900 dark:text-rose-200">{fullSerialNumber}</span>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Step 1: printing Card */}
            <motion.div
              animate={{
                opacity: activeStep === 1 || completedSteps.includes(1) ? 1 : 0.7,
                scale: activeStep === 1 ? 1 : 0.99
              }}
              transition={{ duration: 0.2 }}
            >
              <Card className={isStepCompleted(1) ? "border-green-500 dark:border-green-700 border-2" : ""}>
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${activeStep !== 1 && isStepCompleted(1) ? "cursor-pointer" : ""}`}
                  onClick={() => isStepCompleted(1) && setActiveStep(1)}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step 1: Printing
                    {isStepCompleted(1) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(1) && activeStep !== 1 && (
                    <Button variant="ghost" size="sm">Edit</Button>
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
                              <Label>Date</Label>
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
                                    {jobbcardDate ? format(jobbcardDate, "PPP") : <span>Pick a date</span>}
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
                              </Popover>
                            </div>
                          <div className="space-y-2">
                            <Label className={errors.jcNumber ? "text-destructive" : ""}>
                              JC Number *
                            </Label>
                            <CustomDropdown
                              options={jcNumberOption}
                              value={jcNumber}
                              onValueChange={handleJcNumberChange}
                              placeholder="Select JC Number"
                              searchPlaceholder="Search JC Number..."
                              emptyText="No JC Number found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("jcNumber")}
                            />
                            {errors.jcNumber && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.jcNumber.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className={errors.jcNumber ? "text-destructive" : ""}>
                              JC Description *
                            </Label>
                            <CustomDropdown
                              options={jcDescriptionOption}
                              value={jcDescription}
                              onValueChange={handleJcDescriptionChange}
                              placeholder="Select JC Description"
                              searchPlaceholder="Search JC Description..."
                              emptyText="No JC Description found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("jcDescription")}
                            />
                            {errors.jcNumber && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.jcNumber.message}
                              </motion.p>
                            )}
                          </div>
                          

                          <div className="space-y-2">
                            <Label htmlFor="Status" className={errors.Shift ? "text-destructive" : ""}>Shift</Label>
                            <Select
                              value={shift}
                              onValueChange={(e)=>{setShift(e), setValue("Shift", e)}}
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
                            <Label className={errors.Quantity ? "text-destructive" : ""}>
                              Quantity*
                            </Label>
                            <Input
                            type='number'
                              value={quantity}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setQuantity(newValue);
                                setValue("Quantity", newValue);
                                const calculatedMetars = calculateMetarsOfRuns(newValue, jcAllData);
                                setMetarsOfRuns(calculatedMetars);
                              }}
                              placeholder="Enter Quantity"
                              disabled={!jcAllData}
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
                            <Label className={errors.Quantity ? "text-destructive" : ""}>
                              Meters Of Runs
                            </Label>
                            <Input
                            type='number'
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
                            <Label className={errors.Operator ? "text-destructive" : ""}>
                              Operator
                            </Label>
                            <Input
                            type='text'
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
                            )
                            }

                            </div>

                            <div className='space-y-2'>
                            <DateTimePicker
                              label="Setting Start Time"
                              value={settingStartTime}
                              onChange={handleSettingStartTimeChange}
                            />
                            </div>
                          <div className='space-y-2'>
                            <DateTimePicker
                              label="Setting End Time"
                              value={settingEndTime}
                              onChange={handleSettingEndTimeChange}
                            />
                          </div>
                          <div className="space-y-2">
                          <DateTimePicker
                            label="Production Start Time"
                            value={productionStartTime}
                            onChange={handleProductionStartTimeChange}
                          />
                          </div>
                          <div className="space-y-2">
                          <DateTimePicker
                            label="Production End Time"
                            value={productionEndTime}
                            onChange={handleProductionEndTimeChange}
                          />
                          </div>
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={() => goToNextStep(1, ["jobDate", "jcNumber", "jcDescription", "Quantity", "MetersOfRuns",
                            "Operator", "settingStartTime", "settingEndTime", "productionStartTime", "productionEndTime"
                            ])}
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
                opacity: activeStep === 2 || completedSteps.includes(2) ? 1 : 0.7,
                scale: activeStep === 2 ? 1 : 0.99
              }}
              transition={{ duration: 0.2 }}
            >
              <Card className={isStepCompleted(2) ? "border-green-500 dark:border-green-700 border-2" : ""}>
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${(activeStep !== 2 && isStepCompleted(2)) || activeStep > 2 ? "cursor-pointer" : ""}`}
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
                    <Button variant="ghost" size="sm">Edit</Button>
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

                        {/* <div className="space-y-2">
                              <Label>Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !jobbcardDatePunching && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {jobbcardDatePunching ? format(jobbcardDatePunching, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={jobbcardDatePunching}
                                    // onSelect={(date) => setJobbcardDate(date || new Date())}
                                    onSelect={handleJobDateChangePunching}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                            <Label htmlFor="Status" className={errors.shiftPunching ? "text-destructive" : ""}>Shift</Label>
                            <Select
                              value={shiftPunching}
                              onValueChange={(e)=>{setShiftPunching(e), setValue("shiftPunching", e)}}
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

                            {errors.shiftPunching && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.shiftPunching.message}
                              </motion.p>
                            )}
                          </div> */}

                        <div className='space-y-2'>
                        <Label className={errors.Operator ? "text-destructive" : ""}>
                              Machine 
                            </Label>
                            <Input
                              type="text"
                              className={`form-input w-full ${errors.Operator ? "border-red-500" : ""}`}
                              value={machinePunching}
                              onChange={(e) => {
                                setMachinePunching(e.target.value)
                                setValue("machinePunching", e.target.value)
                                trigger
                              }}
                              placeholder='Enter Machine'
                            />

                        </div>
                      <div className='space-y-2'>
                            <DateTimePicker
                              label="Setting End Time"
                              value={settingStartTimeOne}
                              onChange={handleSettingStartTimeChangeOne}
                            />
                            </div>
                          <div className='space-y-2'>
                            <DateTimePicker
                              label="Setting End Time"
                              value={settingEndTimeOne}
                              onChange={handleSettingEndTimeChangeOne}
                            />
                          </div>
                          <div className="space-y-2">
                          <DateTimePicker
                            label="Production Start Time"
                            value={productionStartTimeOne}
                            onChange={handleProductionStartTimeChangeOne}
                          />
                          </div>
                          <div className="space-y-2">
                          <DateTimePicker
                            label="Production End Time"
                            value={productionEndTimeOne}
                            onChange={handleProductionEndTimeChangeOne}
                          />
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
                opacity: activeStep === (selectedLabelType === 'PP' ? 4 : 3) ||
                  completedSteps.includes(selectedLabelType === 'PP' ? 4 : 3) ? 1 : 0.7,
                scale: activeStep === (selectedLabelType === 'PP' ? 4 : 3) ? 1 : 0.99
              }}
              transition={{ duration: 0.2 }}
            >
              <Card className={isStepCompleted(selectedLabelType === 'PP' ? 5 : 4) ?
                "border-green-500 dark:border-green-700 border-2" : ""}
              >
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${
                    (activeStep !== (selectedLabelType === 'PP' ? 4 : 3) &&
                      isStepCompleted(selectedLabelType === 'PP' ? 4 : 3)) ||
                      activeStep > (selectedLabelType === 'PP' ? 4 : 3) ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (isStepCompleted(selectedLabelType === 'PP' ? 4 : 3) &&
                      activeStep !== (selectedLabelType === 'PP' ? 4 : 3)) {
                      setActiveStep(selectedLabelType === 'PP' ? 4 : 3);
                    } else if (activeStep > (selectedLabelType === 'PP' ? 4 : 3)) {
                      setActiveStep(selectedLabelType === 'PP' ? 4 : 3);
                    }
                  }}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step {selectedLabelType === 'PP' ? "4" : "3"}: Slitting / Finishing
                    {isStepCompleted(selectedLabelType === 'PP' ? 4 : 3) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(selectedLabelType === 'PP' ? 4 : 3) &&
                    activeStep !== (selectedLabelType === 'PP' ? 4 : 3) && (
                      <Button variant="ghost" size="sm">Edit</Button>
                    )}
                </CardHeader>
                <AnimatePresence>
                {activeStep === (selectedLabelType === 'PP' ? 4 : 3) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">


                        <div className="space-y-2">
                              <Label>Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !jobbcardDateFinishing && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {jobbcardDateFinishing ? format(jobbcardDateFinishing, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={jobbcardDateFinishing}
                                    // onSelect={(date) => setjobbcardDateFinishing(date || new Date())}
                                    onSelect={handleJobDateChangeFinishing}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              </div>
                              <div className="space-y-2">
                            <Label className={errors.Operator ? "text-destructive" : ""}>
                              Operator
                            </Label>
                            <Input
                            type='text'
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
                            )
                            }

                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="Status" className={errors.shiftPunching ? "text-destructive" : ""}>Shift</Label>
                            <Select
                              value={shiftFinishing}
                              onValueChange={(e)=>{setShiftFinishing(e), setValue("shiftPunching", e)}}
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

                            {errors.shiftPunching && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.shiftPunching.message}
                              </motion.p>
                            )}
                          </div>
                            {/* <div className="space-y-2">
                              <Label className={errors.Shift ? "text-destructive" : ""}>Shift</Label>
                              <Input
                                type="text"
                                value={shiftFinishing}
                                onChange={(e) => {
                                  setShiftFinishing(e.target.value);
                                  setValue("Shift", e.target.value);
                                }}
                                placeholder="Enter Shift"
                              />
                              {errors.Shift && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.Shift.message}
                                </motion.p>
                              )}
                            </div> */}

                            <div className="space-y-2">
                              <Label className={errors.Machine ? "text-destructive" : ""}>Machine</Label>
                              <Input
                                type="text"
                                value={machineFinsishing}
                                onChange={(e) => {
                                  setMachineFinishing(e.target.value);
                                  setValue("Machine", e.target.value);
                                }}
                                placeholder="Enter Machine"
                              />
                              {errors.Machine && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.Machine.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.NoOfRolls ? "text-destructive" : ""}>Number of Rolls</Label>
                              <Input
                                type="text"
                                value={noOfRolls}
                                onChange={(e) => {
                                  setNumberOfRolls(e.target.value);
                                  setValue("NoOfRolls", e.target.value);
                                }}
                                placeholder="Enter Number of Rolls"
                              />
                              {errors.NoOfRolls && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.NoOfRolls.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.LabelPerRoll ? "text-destructive" : ""}>Labels Per Roll</Label>
                              <Input
                                type="text"
                                value={labelPerRoll}
                                onChange={(e) => {
                                  setLabelPerRoll(e.target.value);
                                  setValue("LabelPerRoll", e.target.value);
                                }}
                                placeholder="Enter Labels Per Roll"
                              />
                              {errors.LabelPerRoll && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.LabelPerRoll.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.CoreSize ? "text-destructive" : ""}>Core Size</Label>
                              <Input
                                type="text"
                                value={coreSize}
                                onChange={(e) => {
                                  setCoreSize(e.target.value);
                                  setValue("CoreSize", e.target.value);
                                }}
                                placeholder="Enter Core Size"
                              />
                              {errors.CoreSize && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.CoreSize.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.WindingDirection ? "text-destructive" : ""}>Winding Direction</Label>
                              <Input
                                type="text"
                                value={windingDirection}
                                onChange={(e) => {
                                  setWindingDirection(e.target.value);
                                  setValue("WindingDirection", e.target.value);
                                }}
                                placeholder="Enter Winding Direction"
                              />
                              {errors.WindingDirection && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.WindingDirection.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.NoOfLabelProduced ? "text-destructive" : ""}>Number of Labels Produced</Label>
                              <Input
                                type="text"
                                value={noOfLabelProduced}
                                onChange={(e) => {
                                  setNoOfLabelProduced(e.target.value);
                                  setValue("NoOfLabelProduced", e.target.value);
                                }}
                                placeholder="Enter Number of Labels Produced"
                              />
                              {errors.NoOfLabelProduced && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.NoOfLabelProduced.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label className={errors.Wastage ? "text-destructive" : ""}>Wastage</Label>
                              <Input
                                type="text"
                                value={wastage}
                                onChange={(e) => {
                                  setWastage(e.target.value);
                                  setValue("Wastage", e.target.value);
                                }}
                                placeholder="Enter Wastage"
                              />
                              {errors.Wastage && (
                                <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >
                                  {errors.Wastage.message}
                                </motion.p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <DateTimePicker
                                label="Setting Start Time"
                                value={settingStartTimeFinishing}
                                onChange={(value: Date | undefined) => {
                                  setSettingStartTimeFinishing(value);
                                  setValue("settingStartTimeFinishing", value);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <DateTimePicker
                                label="Setting End Time"
                                value={settingEndTimeFinishing}
                                onChange={(value: Date | undefined) => {
                                  setSettingEndTimeFinishing(value);
                                  setValue("settingEndTimeFinishing", value);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <DateTimePicker
                                label="Production Start Time"
                                value={productionStartTimeFinishing}
                                onChange={(value: Date | undefined) => {
                                  setProductionStartTimeFinishing(value);
                                  setValue("productionStartTimeFinishing", value);
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <DateTimePicker
                                label="Production End Time"
                                value={productionEndTimeFinishing}
                                onChange={(value: Date | undefined) => {
                                  setProductionEndTimeFinishing(value);
                                  setValue("productionEndTimeFinishing", value);
                                }}
                              />
                            </div>
                              
                          
                        </div>

                        <div className="flex justify-between pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => goToPreviousStep(selectedLabelType === 'PP' ? 5 : 4)}
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
                              onClick={()=>{ goToNextStep(4, [])}}
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-green-600 hover:bg-green-700"
                            > {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {isSubmitting ? "Saving..." : "Save Job Control"}
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
