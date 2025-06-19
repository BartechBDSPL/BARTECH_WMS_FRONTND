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
import { MultiSelect } from '../multi-select';
import { zodResolver } from "@hookform/resolvers/zod";
import { jobCardSchema, type JobCardSchema } from "./job-card-schema";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, CheckCircle, Eye, Printer } from "lucide-react";
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
import { set } from 'date-fns';
import { getWindingImagePath } from '@/utills/new/getWindingImagePath';


interface CustomerData {
  SrNo: number;
  Company: string;
  Address: string;
  ACode: string;
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
const JobControlMaster: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    setFocus,
    formState: { errors, isSubmitting }
  } = useForm<JobCardSchema>({
    resolver: zodResolver(jobCardSchema),
    defaultValues: {
      colors: Array(9).fill({ color: '', anilox: '', bcm: '' }),
      oldProductCode: '',
      cylinderCode: '', // Initialize with empty string
      materialWeb:''
    }
  });

  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [labelTypes, setLabelTypes] = useState<LabelTypeData[]>([]);
  const [paperTypes, setPaperTypes] = useState<PaperTypeData[]>([]);
  const [cylinderData, setCylinderData] = useState<CylinderData[]>([]);
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
    const jd = watch("jobDescription");
    const discriptionData = await checkJobDescription(jd);

    if (discriptionData === "F") {
    toast({
      variant: "destructive",
      title: "Blocked Step",
      description: "Job Description cannot be duplicate."
    });
    setFocus("jobDescription");
    return; 
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
      fetchCustomers(),
      fetchLabelTypes(),
      fetchPaperTypes(),
      fetchRawMaterials(),
      fetchMachines(),
      fetchCylinderData(),
      fetchDieData()
    ]).finally(() => setIsLoading(false));
  }, []);

  

  const checkJobDescription = async (data: string) => {
    if (!data) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/api/master/get-jobdiscrinption-check`, { JobDescription:data })
      if (response.data[0].Status) {
       
        return response.data[0].Status ;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-customer`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error fetching customers",
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  };

  const fetchLabelTypes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-labeltype`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLabelTypes(response.data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch label types" });
    }
  };

  const fetchPaperTypes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-label-paper-type`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaperTypes(response.data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch paper types" });
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-raw-material`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRawMaterials(response.data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch raw materials" });
    }
  };

  const fetchMachines = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-machine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMachines(response.data);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch machines" });
    }
  };

  const fetchDieData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-die`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDieData(response.data);

      const uniqueDieTypes = Array.from(new Set(response.data.map((die: DieData) => die.DieType))) as string[];
      setDieTypes(uniqueDieTypes);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch die data" });
    }
  };

  const fetchCylinderData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-cylinder`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCylinderData(response.data);

      const uniqueCylinderCode = Array.from(new Set(response.data.map((cylinder: CylinderData) => cylinder.CylinderCode))) as string[];
      setCylinderCode(uniqueCylinderCode);
    } catch (error) {
      toast({ variant: 'destructive', title: "Failed to fetch die data" });
    }
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    setValue("company", value);
    // Find all addresses for the selected company
    const companyAddresses = customers
      .filter(c => c.Company === value)
      .map(c => c.Address);
    setAddresses(companyAddresses);
  };

  const handleDieTypeChange = (value: string) => {
    setSelectedDieType(value);
    setValue("dieType", value);

    const filteredDieNumbers = dieData
      .filter(die => die.DieType === value)
      .map(die => die.DieNo);

    setDieNumbers(filteredDieNumbers);

    setValue("dieNumber", undefined);
  };

  const handleCylinderCodeChange = (value: string) => {
    setSelectedCylinderCode(value);
    setValue("cylinderCode", value); // This sets the value in the form correctly
  }



  const handleCustomValueChange = (field: keyof JobCardSchema) => (value: string) => {
    setValue(field, value);
    switch (field) {
      case "company":
        setSelectedCompany(value);
        setAddresses([]);
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

  const handleRawMaterialChange = (value: string) => {
    setSelectedRawMaterial(value);
    setValue("rawMaterial", value);
    const material = rawMaterials.find(m => m.RawMatCode === value);
    setRawMaterialDesc(material?.RawMatDes || "");
  };

  const displayConvertedValue = (value: number | undefined, isMetricUnit: boolean): string => {
    if (!value) return "-";
    const converted = isMetricUnit ? (value / 25.4).toFixed(2) : (value * 25.4).toFixed(2);
    return `${converted} ${isMetricUnit ? 'inch' : 'mm'}`;
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<JobCardSchema | null>(null);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  // console.log(isDialogOpen)

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'oldProductCode') {
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const [oldProductCodeValue, setOldProductCodeValue] = useState<string>("");

  const handleOldProductCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOldProductCodeValue(value);
    setValue("oldProductCode", value);
  };

  const onSubmitForm = (data: JobCardSchema) => {


    if (selectedLabelType === 'PP' && !validateColors()) {
      return;
    }

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
      formDataObj.append('AltRibbonType', formData.alternateRibbonType || "");
      formDataObj.append('ArtworkNo', formData.artWorkNo || "");
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          formDataObj.append('files', file);
        });
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/master/insert-job-card`,
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

  const windingImagePath = getWindingImagePath(formData?.windingDirection);

  const handleReset = () => {
    reset();
    setSelectedCompany("");
    setAddresses([]);
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

  const renderDimensionsStep = () => (
    <CardContent className="space-y-4 pt-0">
      {/* Unit Selection */}
      <div className="flex items-center justify-end space-x-2">
        <span className={isMetric ? "font-bold" : ""}>MM</span>
        <Switch
          checked={isMetric}
          onCheckedChange={setIsMetric}
        />
        <span className={!isMetric ? "font-bold" : ""}>Inch</span>
      </div>

      {/* Dimensions Input with fixed handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={errors.width ? "text-destructive" : ""}>
            Width* ({isMetric ? 'mm' : 'inch'})
          </Label>
          <Input
            type="number"
            step="0.01"
            {...register("width")}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") return;

              const numVal = parseFloat(val);
              if (numVal > 1000) {
                e.target.value = "1000";
              }
            }}
          />
          {errors.width && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive"
            >
              {errors.width.message}
            </motion.p>
          )}
        </div>
        <div className="space-y-2">
          <Label className={errors.height ? "text-destructive" : ""}>
            Height* ({isMetric ? 'mm' : 'inch'})
          </Label>
          <Input
            type="number"
            step="0.01"
            {...register("height")}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") return;

              const numVal = parseFloat(val);
              if (numVal > 1000) {
                e.target.value = "1000";
              }
            }}
          />
          {errors.height && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive"
            >
              {errors.height.message}
            </motion.p>
          )}
        </div>
      </div>

      {/* Measurement Legend */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-muted/50 dark:bg-muted/20 rounded-lg border mt-4"
      >
        <h4 className="font-medium mb-2 text-muted-foreground">Measurement Conversion</h4>
        <div className="grid grid-cols-2 gap-4">
          {(width || height) ? (
            <>
              {width && (
                <>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Current Width</Label>
                    <p className="font-medium">{width} {isMetric ? 'mm' : 'in'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Converted Width</Label>
                    <p className="font-medium">{displayConvertedValue(Number(width), isMetric)}</p>
                  </div>
                </>
              )}

              {height && (
                <>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Current Height</Label>
                    <p className="font-medium">{height} {isMetric ? 'mm' : 'in'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground text-xs">Converted Height</Label>
                    <p className="font-medium">{displayConvertedValue(Number(height), isMetric)}</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="col-span-2 text-sm text-muted-foreground">
              Enter dimensions to see the conversion.
            </p>
          )}
        </div>
      </motion.div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => goToPreviousStep(selectedLabelType === 'PP' ? 4 : 3)}
        >
          <ChevronUp className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          type="button"
          onClick={() => goToNextStep(
            selectedLabelType === 'PP' ? 4 : 3,
            ["width", "height"]
          )}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  );

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
              font-size: 13px;
            }
            td {
              font-weight: 500;
            }
            td:nth-child(odd) {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background-color: #f0f0f0;
              padding: 10px;
             
              margin-bottom: 10px;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 20px;
              flex-grow: 1;
            }
            .qr-code {
              width: 80px; /* Smaller size for better fit */
              height: 80px;
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
            .winding-image {
              max-height: 40px;
              width: auto;
              display: block;
              
              margin-bottom: 2px;
            }
            @media print {
              body { zoom: 100%; }
              table { border: 2px solid #000 !important; }
              th, td { border: 2px solid #000 !important; }
              .qr-code { width: 80px !important; height: 80px !important; }
              .winding-image {
            max-height: 40px !important;
          }
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
            <div class="header-container">
              <div class="header">JOB CONTROL MASTER</div>
              <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${jobNumber}" alt="QR Code">
            </div>
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
            Job Control Preview - {jobNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div id="job-card-print-content" className="border border-gray-800">
            {/* <div className="text-center bg-gray-100 font-bold text-xl border-b border-gray-800 py-2">
              JOB Control
            </div> */}
            
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">Label Type</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 font-semibold">{formData.labelType}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">JC No</td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 text-red-600 font-semibold">{jobNumber}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Customer Name</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.company}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Job Description</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.jobDescription}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Code</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.rawMaterial || ""}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Web</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{materialWeb || ""}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Material Description</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{rawMaterialDesc || ""}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Lamination Material / Varnish</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.laminationMaterial || ""}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Foil Material Code</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.foilMaterialCode || ""}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Special Characteristics</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.specialCharacteristic || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Artwork No.</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.artWorkNo || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Machine</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.machines || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Thermal Printing Required</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold" colSpan={3}>{formData.thermalPrintingRequired || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Ribbon Type</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.ribbontype || "-"}</td>
                  <td className='border border-gray-800 font-bold px-2 py-1 bg-gray-100'>Alternative Ribbon Type</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.alternateRibbonType || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Customer Part No.</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.customerPartNo || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Size</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{`${formData.width || 0}X${formData.height || 0}`}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Cylinder Teeth</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{formData.cylinderCode || selectedCylinderCode || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Ups Across</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.upsAcross || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Supply Form</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.supplyForm || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Ups Along</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.upsAlong || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Winding Direction</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold"> <img
                     className="winding-image"
                     src={windingImagePath}
                     alt="Winding Image"
                   /></td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Gap Across</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.gapAcross || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Foiling</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.foilMaterialCode || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Gap Along</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.gapAlong || "1"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Die Number</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{formData.dieNumber || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100 ">Die Type</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{formData.dieType || "-"}</td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Plate Folder Number</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{plateFolderNumber || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Slitting Ups</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">{formData.ups || "-"}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Core Dia</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.core || "-"}</td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">Number of labels per roll</td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{formData.numberOfLabels || "-"}</td>
                </tr>
              </tbody>
            </table>
            
            {/* Only show color sequence for PP label type */}
            {selectedLabelType === 'PP' && colorTable.length > 0 && (
              <div className="mt-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-800 font-bold px-2 py-1 text-center" colSpan={4}>
                        Color Sequence
                      </th>
                    </tr>
                    <tr>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Unit No</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Color</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">Anilox</th>
                      <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">BCM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorTable.map((color, index) => (
                      <tr key={index}>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.ColorNo}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.Color}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.Anilox}</td>
                        <td className="border border-gray-800 px-2 py-1 text-center">{color.BCM}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

  console.log(formData);

  



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
            {/* Step 1: Customer Details Card */}
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
                    Step 1: Customer Details
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className={errors.company ? "text-destructive" : ""}>
                              Customer Name*
                            </Label>
                            <CustomDropdown
                              options={Array.from(new Set(customers.map(c => c.Company)))
                                .map(company => ({ value: company, label: company }))}
                              value={selectedCompany}
                              onValueChange={handleCompanyChange}
                              placeholder="Select Customer"
                              searchPlaceholder="Search Customer..."
                              emptyText="No companies found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("company")}
                            />
                            {errors.company && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.company.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className={errors.address ? "text-destructive" : ""}>
                              Customer Address*
                            </Label>
                            <CustomDropdown
                              options={addresses.map(a => ({ value: a, label: a }))}
                              value={watch("address") || ""}
                              onValueChange={(value) => setValue("address", value)}
                              placeholder="Select Address"
                              searchPlaceholder="Search address..."
                              emptyText="No addresses found"
                              disabled={!selectedCompany}
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("address")}
                            />
                            {errors.address && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.address.message}
                              </motion.p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className={errors.jobDescription ? "text-destructive" : ""}>
                              Job Description*
                            </Label>
                            <Input
                              {...register("jobDescription")}
                              placeholder="Enter job description"
                            />
                            {errors.jobDescription && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >
                                {errors.jobDescription.message}
                              </motion.p>
                            )}
                          </div>
                          {/* <div className="space-y-2">
                            <Label>Paper Type</Label>
                            <CustomDropdown
                              options={paperTypes.map(pt => ({
                                value: pt.Lpapertypecode,
                                label: `${pt.Lpapertypecode} - ${pt.LpapertypeDes}`
                              }))}
                              value={watch("paperType") || ""}
                              onValueChange={(value) => setValue("paperType", value)}
                              placeholder="Select Paper Type"
                              searchPlaceholder="Search paper type..."
                              emptyText="No paper types found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("paperType")}
                            />
                          </div> */}
                        </div>
                        <div className="flex justify-end pt-4">
                          <Button
                            type="button"
                            onClick={() => {
                              goToNextStep(1, ["company", "address", "jobDescription"]);
                              
                            }}
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
                    Step 2: Label Type
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
                        <div className="space-y-2">
                          <Label className={errors.labelType ? "text-destructive" : ""}>
                            Label Type*
                          </Label>
                          <CustomDropdown
                            options={labelTypes.map(lt => ({
                              value: lt.LtypeCode,
                              label: `${lt.LtypeCode} - ${lt.LtypeDes}`
                            }))}
                            value={selectedLabelType || ""}
                            onValueChange={(value) => setValue("labelType", value)}
                            placeholder="Select Label Type"
                            searchPlaceholder="Search label type..."
                            emptyText="No label types found"
                            allowCustomValue
                            onCustomValueChange={handleCustomValueChange("labelType")}
                          />
                          {errors.labelType && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >
                              {errors.labelType.message}
                            </motion.p>
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
                            onClick={() => goToNextStep(2, ["labelType"])}
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

            {/* Step 3: Color Selection (Conditional) */}
            {selectedLabelType === 'PP' && (
              <motion.div
                animate={{
                  opacity: activeStep === 3 || completedSteps.includes(3) ? 1 : 0.7,
                  scale: activeStep === 3 ? 1 : 0.99
                }}
                transition={{ duration: 0.2 }}
              >
                <Card className={isStepCompleted(3) ? "border-green-500 dark:border-green-700 border-2" : ""}>
                  <CardHeader
                    className={`flex flex-row items-center justify-between pb-2 ${(activeStep !== 3 && isStepCompleted(3)) || activeStep > 3 ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (isStepCompleted(3) && activeStep !== 3) {
                        setActiveStep(3);
                      } else if (activeStep > 3) {
                        setActiveStep(3);
                      }
                    }}
                  >
                    <CardTitle className="text-lg font-bold flex items-center">
                      Step 3: Color Selection
                      {isStepCompleted(3) && (
                        <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                      )}
                    </CardTitle>
                    {isStepCompleted(3) && activeStep !== 3 && (
                      <Button variant="ghost" size="sm">Edit</Button>
                    )}
                  </CardHeader>
                  <AnimatePresence>
                    {activeStep === 3 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="space-y-4 pt-0">
                          <div className="space-y-2">
                            <Label>Number of Colors</Label>
                            <Select
                              value={numColors.toString()}
                              onValueChange={(value) => setNumColors(parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of colors" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(9)].map((_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Color Sequence</Label>
                            {[...Array(numColors)].map((_, index) => (
                              <div className="grid grid-cols-4 gap-4 mt-2" key={index}>
                                <div className="flex items-center justify-center">
                                  <span className="font-medium">{index + 1}</span>
                                </div>
                                <Input {...register(`colors.${index}.color`)} placeholder="Color" />
                                <Input {...register(`colors.${index}.anilox`)} placeholder="Anilox" />
                                <Input {...register(`colors.${index}.bcm`)} placeholder="BCM" />
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => goToPreviousStep(3)}
                            >
                              <ChevronUp className="mr-2 h-4 w-4" /> Back
                            </Button>
                            <Button
                              type="button"
                              onClick={() => goToNextStep(3, [])}
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
            )}

            {/* Step 4: Dimensions */}
            <motion.div
              animate={{
                opacity: activeStep === (selectedLabelType === 'PP' ? 4 : 3) ||
                  completedSteps.includes(selectedLabelType === 'PP' ? 4 : 3) ? 1 : 0.7,
                scale: activeStep === (selectedLabelType === 'PP' ? 4 : 3) ? 1 : 0.99
              }}
              transition={{ duration: 0.2 }}
            >
              <Card className={isStepCompleted(selectedLabelType === 'PP' ? 4 : 3) ?
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
                    Step {selectedLabelType === 'PP' ? "4" : "3"}: Dimensions
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
                      {renderDimensionsStep()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Step 5: Additional Details */}
            <motion.div
              animate={{
                opacity: activeStep === (selectedLabelType === 'PP' ? 5 : 4) ||
                  completedSteps.includes(selectedLabelType === 'PP' ? 5 : 4) ? 1 : 0.7,
                scale: activeStep === (selectedLabelType === 'PP' ? 5 : 4) ? 1 : 0.99
              }}
              transition={{ duration: 0.2 }}
            >
              <Card className={isStepCompleted(selectedLabelType === 'PP' ? 5 : 4) ?
                "border-green-500 dark:border-green-700 border-2" : ""}
              >
                <CardHeader
                  className={`flex flex-row items-center justify-between pb-2 ${
                    (activeStep !== (selectedLabelType === 'PP' ? 5 : 4) &&
                      isStepCompleted(selectedLabelType === 'PP' ? 5 : 4)) ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (isStepCompleted(selectedLabelType === 'PP' ? 5 : 4) &&
                      activeStep !== (selectedLabelType === 'PP' ? 5 : 4)) {
                      setActiveStep(selectedLabelType === 'PP' ? 5 : 4);
                    }
                  }}
                >
                  <CardTitle className="text-lg font-bold flex items-center">
                    Step {selectedLabelType === 'PP' ? "5" : "4"}: Additional Details
                    {isStepCompleted(selectedLabelType === 'PP' ? 5 : 4) && (
                      <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  {isStepCompleted(selectedLabelType === 'PP' ? 5 : 4) &&
                    activeStep !== (selectedLabelType === 'PP' ? 5 : 4) && (
                      <Button variant="ghost" size="sm">Edit</Button>
                    )}
                </CardHeader>
                <AnimatePresence>
                  {activeStep === (selectedLabelType === 'PP' ? 5 : 4) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="space-y-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                          <div className="space-y-2">
                            <Label className={errors.ups ? "text-destructive" : ""}>Sliting Ups <span className='text-destructive'>*</span></Label>
                            <Select onValueChange={(value) => setValue("ups", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Sliting ups" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                                    {(i + 1).toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.ups && (<motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >{errors.ups.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.core ? "text-destructive" : ""}>Core (inch) <span className='text-destructive'>*</span></Label>
                            <Select onValueChange={(value) => setValue("core", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select core size" />
                              </SelectTrigger>
                              <SelectContent>
                                {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0].map((size) => (
                                  <SelectItem key={size} value={size.toString()}>
                                    {size.toFixed(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.core && (<motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >{errors.core.message}</motion.p>)
                            }
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.rawMaterial ? "text-destructive" : ""}>Raw Material <span className='text-destructive'>*</span></Label>
                            <CustomDropdown
                              options={rawMaterials.map(rm => ({
                                value: rm.RawMatCode,
                                label: rm.RawMatCode
                              }))}
                              value={selectedRawMaterial}
                              onValueChange={handleRawMaterialChange}
                              placeholder="Select Raw Material"
                              searchPlaceholder="Search raw material..."
                              emptyText="No raw materials found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("rawMaterial")}
                            />
                            {errors.rawMaterial && (<motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >{errors.rawMaterial.message}</motion.p>)}
                        
                          </div>

                          {rawMaterialDesc && (
                            <div className="space-y-2">
                              <Label>Raw Material Description</Label>
                              <Input value={rawMaterialDesc} disabled />
                            </div>
                          )}

                              <div className="space-y-2">
                              <Label className={errors.materialWeb ? "text-destructive" : ""}>Material Web <span className='text-destructive'>*</span></Label>
                              <Input 
                                value={materialWeb}
                                onChange={(e) => {
                                setMaterialWeb(e.target.value);
                                setValue("materialWeb", e.target.value);
                                }}
                                
                              />
                              {errors.materialWeb && (<motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >{errors.materialWeb.message}</motion.p>)}
                              </div>
                              <div className="space-y-2">
                              <Label className={errors.plateFolderNumber ? "text-destructive" : ""}>Plate Folder Number <span className='text-destructive'>*</span></Label>
                              <Input 
                                value={plateFolderNumber}
                                onChange={(e) => {
                                setPlateFolderNumber(e.target.value);
                                setValue("plateFolderNumber", e.target.value);
                                }}
                                
                              />
                              {errors.plateFolderNumber &&(<motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-destructive"
                              >{errors.plateFolderNumber.message}</motion.p>)}
                              </div>


                          <div className="space-y-2">
                            <Label className={errors.cut ? "text-destructive" : ""}>Cut <span className='text-destructive'>*</span></Label>
                            <Select onValueChange={(value) => setValue("cut", value)} >
                              <SelectTrigger>
                                <SelectValue placeholder="Select cut option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                                {errors.cut &&(
                                  <motion.p
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="text-sm text-destructive"
                                >{errors.cut.message}</motion.p>
                                )}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.perforation ? "text-destructive" : ""}>Perforation <span className='text-destructive'>*</span></Label>
                            <Select onValueChange={(value) => setValue("perforation", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select perforation option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">Yes</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.perforation &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.perforation.message}</motion.p>)}
                            
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.dieType ? "text-destructive" : ""}>Die Type <span className='text-destructive'>*</span></Label>
                            <CustomDropdown
                              options={dieTypes.map(dt => ({
                                value: dt,
                                label: dt
                              }))}
                              value={selectedDieType}
                              onValueChange={handleDieTypeChange}
                              placeholder="Select Die Type"
                              searchPlaceholder="Search Die type..."
                              emptyText="No Die types found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("dieType")}
                            />
                            
                            {errors.dieType &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.dieType.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.dieNumber ? "text-destructive" : ""}>Die Number <span className='text-destructive'>*</span></Label>
                            <CustomDropdown
                              options={dieNumbers.map(dn => ({
                                value: dn,
                                label: dn
                              }))}
                              value={watch("dieNumber") || ""}
                              onValueChange={(value) => setValue("dieNumber", value)}
                              placeholder="Select Die Number"
                              searchPlaceholder="Search Die Number..."
                              emptyText="No Die Number found"
                              disabled={!selectedDieType}
                              allowCustomValue
                              
                              onCustomValueChange={handleCustomValueChange("dieNumber")}
                            />
                            {errors.dieNumber &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.dieNumber.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.cylinderCode ? "text-destructive" : ""}>Cylinder Teeth <span className='text-destructive'>*</span></Label>
                            <CustomDropdown
                              options={cylinderCode.map(cc => ({
                                value: cc,
                                label: cc
                              }))}
                              value={selectedCylinderCode}
                              onValueChange={handleCylinderCodeChange}
                              placeholder="Select Cylinder Teeth"
                              searchPlaceholder="Search Cylinder Teeth..."
                              emptyText="No Cylinder Teeth found"
                              allowCustomValue
                              onCustomValueChange={handleCustomValueChange("cylinderCode")}
                            />
                            {errors.cylinderCode &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.cylinderCode.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label  className={errors.laminationMaterial ? "text-destructive" : ""}>Lamination Material / Varnish <span className='text-destructive'>*</span></Label>
                            <Input {...register("laminationMaterial")} />
                            {errors.laminationMaterial &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.laminationMaterial.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.foilMaterialCode ? "text-destructive" : ""}>Foil Material Code <span className='text-destructive'>*</span></Label>
                            <Input {...register("foilMaterialCode")} />
                            {errors.foilMaterialCode &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.foilMaterialCode.message}</motion.p>)}
                          </div>

                          {/* New additional fields */}
                          <div className="space-y-2">
                            <Label className={errors.upsAcross ? "text-destructive" : ""}>Ups Across <span className='text-destructive'>*</span></Label>
                            <Input {...register("upsAcross")} />
                            {errors.upsAcross &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.upsAcross.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.upsAlong ? "text-destructive" : ""}>Ups Along <span className='text-destructive'>*</span></Label>
                            <Input {...register("upsAlong")} />
                            {errors.upsAlong &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.upsAlong.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.gapAcross ? "text-destructive" : ""}>Gap Across <span className='text-destructive'>*</span></Label>
                            <Input {...register("gapAcross")} />
                            {errors.gapAcross &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.gapAcross.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.gapAlong ? "text-destructive" : ""}>Gap Along <span className='text-destructive'>*</span></Label>
                            <Input {...register("gapAlong")} />
                            {errors.gapAlong &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.gapAlong.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.numberOfLabels ? "text-destructive" : ""}>Number of labels per roll <span className='text-destructive'>*</span></Label>
                            <Input {...register("numberOfLabels")} />
                            {errors.numberOfLabels &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.numberOfLabels.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.customerPartNo ? "text-destructive" : ""}>Customer Part Number <span className='text-destructive'>*</span></Label>
                            <Input {...register("customerPartNo")} />
                            {errors.customerPartNo &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.customerPartNo.message}</motion.p>)}
                          </div>

                          {/* <div className="space-y-2">
                            <Label>Block Number</Label>
                            <Input {...register("blockNo")} />
                          </div> */}
                          <div className="space-y-2">
                            <Label className={errors.supplyForm ? "text-destructive" : ""}>Supply Form <span className='text-destructive'>*</span></Label>
                            <Input {...register("supplyForm")} />
                            {errors.supplyForm &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.supplyForm.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.thermalPrintingRequired ? "text-destructive" : ""}>Thermal Printing Required <span className='text-destructive'>*</span></Label>
                            <Input {...register("thermalPrintingRequired")} />
                            {errors.thermalPrintingRequired &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.thermalPrintingRequired.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.ribbontype ? "text-destructive" : ""}>Ribbon Type <span className='text-destructive'>*</span></Label>
                            <Input {...register("ribbontype")} />
                            {errors.ribbontype &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.ribbontype.message}</motion.p>)}
                          </div>
                          {/* alternateRibbonType */}
                          <div className="space-y-2">
                            <Label className={errors.alternateRibbonType ? "text-destructive" : ""}>Alternate Ribbon Type </Label>
                            <Input {...register("alternateRibbonType")} />
                            {errors.alternateRibbonType &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className='text-sm text-destructive'
                            >{errors.alternateRibbonType.message}</motion.p>)}
                            </div>



                          <div className="space-y-2">
                            <Label className={errors.windingDirection ? "text-destructive" : ""}>Winding Direction <span className='text-destructive'>*</span></Label>
                            <Select onValueChange={(value) => setValue("windingDirection", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select winding direction" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 8 }, (_, i) => `F${i + 1}`).map((direction) => (
                                  <SelectItem key={direction} value={direction}>
                                    {direction}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.windingDirection &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.windingDirection.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.specialCharacteristic ? "text-destructive" : ""}>Special Characteristic <span className='text-destructive'>*</span></Label>
                            <Input {...register("specialCharacteristic")} />
                            {errors.specialCharacteristic &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.specialCharacteristic.message}</motion.p>)}
                          </div>
                          <div className="space-y-2">
                            <Label className={errors.artWorkNo ? "text-destructive" : ""}>Artwork No. <span className='text-destructive'>*</span></Label>
                            <Input {...register("artWorkNo")} />
                            {errors.artWorkNo &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.artWorkNo.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.oldProductCode ? "text-destructive" : ""}>Old Product Code <span className='text-destructive'>*</span></Label>
                            <Input
                              {...register("oldProductCode")}
                              placeholder="Enter old product code"
                              value={oldProductCodeValue}
                              onChange={handleOldProductCodeChange}
                            />
                            {errors.oldProductCode &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.oldProductCode.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label className={errors.machines ? "text-destructive" : ""}>Machines <span className='text-destructive'>*</span></Label>
                            <MultiSelect
                              options={machines.map(machine => ({
                                label: `${machine.MachineCode} - ${machine.MachineDes}`,
                                value: machine.MachineCode,
                              }))}
                              placeholder="Select machines..."
                              onValueChange={(values) => {
                                setValue("machines", values.join(','));
                              }}
                              defaultValue={watch("machines")?.split(',').filter(Boolean) || []}
                              value={watch("machines")?.split(',').filter(Boolean) || []}
                              className="w-full"
                            />
                            {errors.machines &&(<motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm text-destructive"
                            >{errors.machines.message}</motion.p>)}
                          </div>

                          <div className="space-y-2">
                            <Label>Upload Files</Label>
                            <FileUpload onFilesChange={handleFilesChange} />
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
                              onClick={()=>{ goToNextStep(4, ['ups','core','rawMaterial','materialWeb','plateFolderNumber','cut','perforation','dieType','dieNumber','cylinderCode','laminationMaterial','foilMaterialCode','upsAcross','upsAlong','gapAcross','gapAlong','numberOfLabels','customerPartNo','supplyForm','thermalPrintingRequired','ribbontype','windingDirection','specialCharacteristic','oldProductCode','machines'])}}
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

export default JobControlMaster;
