"use client";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CalendarIcon,
  ChevronDown,
  Eye,
  Printer,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import getUserID, { BACKEND_URL } from "@/lib/constants";
import jsPDF from "jspdf";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import Cookies from "js-cookie";
import ExportToExcel from "@/utills/reports/ExportToExcel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import TableSearch from "@/utills/tableSearch";
import CustomDropdown from "../../CustomDropdown";
import { Label } from "../../ui/label";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "../../ui/dialog";
import { getWindingImagePath } from "@/utills/new/getWindingImagePath";

interface CustomerData {
  SrNo: number;
  Company: string;
  Address: string;
  ACode: string;
}
interface RawMaterialData {
  RawMatCode: string;
  RawMatDes: string;
}

interface JobCardReportData {
  SrNo: string;
  CompanyName: string;
  CompanyAddress: string;
  JobDescription: string;
  LabelType: string;
  Height: string;
  Width: string;
  Unit: string;
  Ups: string;
  Core: string;
  MatCode: string;
  MatDesc: string;
  LaminationMaterial: string;
  FoilMaterialCode: string;
  UpsAcross: string;
  UpsAlong: string;
  GapAcross: string;
  GapAlong: string;
  NumberOfLabel: string;
  CustomerPartNumber: string;
  SupplyForm: string;
  ThermalPrintingRequired: string;
  RibbonType: string;
  SpecialCharacteristic: string;
  ArtworkNo: string;
  OldProductCode: string;
  DieType?: string;
  DieNumber?: string;
  JcSerialNumber?: string;
  Machine?: string;
  ColorNo?: string;
  PaperType?: string;
  BlockNo?: string;
  WindingDirection?: string;
  LabelDescription?: string;
  CylinderCode?: string;
  Image?: string;
  ApprovedBy?: string;
  ApprovedDate?: string;
  ApproveStatus?: string;
  MaterialWeb?: string;
  PlateFolderNo?: string;
  CreatedBy?: string;
  CreatedDate?: string;
  UpdatedBy?: string | null;
  UpdatedDate?: string | null;
  JobCardNumber: string;
  AltRibbonType: string;
  CutPerforation:string;
}

interface PreviewJobCardParams {
  jobCard: JobCardReportData;
}

interface FetchColorSequenceParams {
  jobCardNumber: string;
}

interface ColorSequenceData {
  Status: string;
  Message: string;
  Color: string;
  Anilox: string;
  BCM: string;
  JobCardNumber: string;
  CreatedBy: string;
  CreatedDate: string;
  ColorSequence: string;
}

interface LabelTypeData {
  SrNo: number;
  LtypeCode: string;
  LtypeDes: string;
}

const JobControlMasterEdit = () => {
  const [showTable, setShowTable] = useState(false);
  const [reportData, setReportData] = useState<JobCardReportData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedJobCard, setSelectedJobCard] =
    useState<JobCardReportData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);


    // Table and selection state

  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Dropdown options
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [labelTypes, setLabelTypes] = useState<LabelTypeData[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialData[]>([]);

  // Edit form state (all fields)
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [labelType, setLabelType] = useState("");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [unit, setUnit] = useState("");
  const [ups, setUps] = useState("");
  const [core, setCore] = useState("");
  
  const [rawMaterial, setRawMaterial] = useState("");
  const [rawMaterialDesc, setRawMaterialDesc] = useState("");
  const [laminationMaterial, setLaminationMaterial] = useState("");
  const [foilMaterialCode, setFoilMaterialCode] = useState("");
  const [upsAcross, setUpsAcross] = useState("");
  const [upsAlong, setUpsAlong] = useState("");
  const [gapAcross, setGapAcross] = useState("");
  const [gapAlong, setGapAlong] = useState("");
  const [numberOfLabels, setNumberOfLabels] = useState("");
  const [customerPartNumber, setCustomerPartNumber] = useState("");
  const [supplyForm, setSupplyForm] = useState("");
  const [thermalPrintingRequired, setThermalPrintingRequired] = useState("");
  const [ribbonType, setRibbonType] = useState("");
  const [alternateRibbonType, setAlternateRibbonType] = useState("");
  const [specialCharacteristic, setSpecialCharacteristic] = useState("");
  const [artworkNo, setArtworkNo] = useState("");
  const [oldProductCode, setOldProductCode] = useState("");
  const [jobCardNumber, setJobCardNumber] = useState("");
  const [jcSerialNumber, setJcSerialNumber] = useState("");
  const [dieType, setDieType] = useState("");
  const [dieNumber, setDieNumber] = useState("");
  const [cutPerforation, setCutPerforation] = useState("");
const [machine, setMachine] = useState("");
const [colorNo, setColorNo] = useState("");
const [paperType, setPaperType] = useState("");
const [blockNo, setBlockNo] = useState("");
const [windingDirection, setWindingDirection] = useState("");
const [labelDescription, setLabelDescription] = useState("");
const [image, setImage] = useState(""); 
const [cylinderCode, setCylinderCode] = useState("");
const [materialWeb, setMaterialWeb] = useState("");
const [plateFolderNo, setPlateFolderNo] = useState("");

  const [editMode, setEditMode] = useState(false);

  const [CompanyAddressError, setCompanyAddressError] = useState(true);

  const [colorSequenceData, setColorSequenceData] = useState<{
    [key: string]: ColorSequenceData[];
  }>({});
  const token = Cookies.get("token");

  useEffect(() => {
    const fetch = () => {
      handleSubmitSearch();
      fetchCustomers();
      fetchRawMaterials();
    };
    fetch();
  }, []);

  const fetchLabelTypes = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-all-labeltype`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLabelTypes(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch label types" });
    }
  };

  // ===========================================this is to input data ===================

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-all-customer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCustomers(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching customers",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/master/get-all-raw-material`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRawMaterials(response.data);
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to fetch raw materials" });
    }
  };


 useEffect(() => {
    if (companyName) {
      const found = customers.find((c) => c.Company === companyName);
      setAddresses(found ? [found.Address] : []);
      setCompanyAddress("");
    }
  }, [companyName, customers]);

  // When raw material changes, set its description
  useEffect(() => {
    if (rawMaterial) {
      const found = rawMaterials.find((r) => r.RawMatCode === rawMaterial);
      setRawMaterialDesc(found ? found.RawMatDes : "");
    } else {
      setRawMaterialDesc("");
    }
  }, [rawMaterial, rawMaterials]);

  useEffect(()=>{
    setCompanyAddressError(true);
  },[companyAddress])



  const filteredData = useMemo(() => {
    return reportData.filter((item) => {
      const searchableFields = [
        "JobCardNumber",
        "LabelType",
        "CompanyName",
        "JobDescription",
        "MatCode",
        "MatDesc",
        "CreatedBy",
      ];
      return searchableFields.some((key) => {
        const value = (item as any)[key];
        return (
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    });
  }, [reportData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / itemsPerPage),
    [filteredData, itemsPerPage]
  );

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  }, []);

  const handleSubmitSearch = async () => {
    // const {CompanyName, Height, Width, JobCardNumber, LabelType, FrmDate, ToDate } = req.body;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/master/getJobCardMasterAlladata`
      );
      //   console.log(response.data);
      const data: JobCardReportData[] = await response.data;

      setReportData(data);
      setShowTable(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLabelTypes();
  }, []);

  const fetchColorSequence = async ({
    jobCardNumber,
  }: FetchColorSequenceParams): Promise<ColorSequenceData[]> => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/reports/get-color-sequence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ JobCardNumber: jobCardNumber }),
        }
      );

      const data: ColorSequenceData[] = await response.json();
      setColorSequenceData((prev) => ({ ...prev, [jobCardNumber]: data }));
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch color sequence data",
        variant: "destructive",
      });
      return [];
    }
  };

  const handlePreviewClick = async ({
    jobCard,
  }: PreviewJobCardParams): Promise<void> => {
    setSelectedJobCard(jobCard);

    // If job card is PP type and we don't have color data yet, fetch it
    if (
      jobCard.LabelType === "PP" &&
      !colorSequenceData[jobCard.JobCardNumber]
    ) {
      await fetchColorSequence({ jobCardNumber: jobCard.JobCardNumber });
    }

    setIsPreviewOpen(true);
  };
  
const handleClear = () => {
    setEditIndex(null);
    setCompanyName("");
    setCompanyAddress("");
    setJobDescription("");
    setLabelType("");
    setHeight("");
    setWidth("");
    setUnit("");
    setUps("");
    setCore("");
    setRawMaterial("");
    setRawMaterialDesc("");
    setLaminationMaterial("");
    setFoilMaterialCode("");
    setUpsAcross("");
    setUpsAlong("");
    setGapAcross("");
    setGapAlong("");
    setNumberOfLabels("");
    setCustomerPartNumber("");
    setSupplyForm("");
    setThermalPrintingRequired("");
    setRibbonType("");
    setSpecialCharacteristic("");
    setArtworkNo("");
    setOldProductCode("");
    setJobCardNumber("");
    setJcSerialNumber("");
    setDieType("");
    setDieNumber("");
    setEditMode(false)
    handleSubmitSearch();
    fetchCustomers();
    fetchRawMaterials();
    setAlternateRibbonType("")
    setCompanyAddressError(true);
    setCylinderCode("");
  };


  const NoDataCard = () => (
    <Card className="mt-5">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No Data Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          No records found for the given search criteria. Try adjusting your
          filters or selecting a different date range.
        </p>
      </CardContent>
    </Card>
  );
  const JobCardPreviewDialog = ({
    jobCard,
    colorSequence,
  }: {
    jobCard: JobCardReportData;
    colorSequence: ColorSequenceData[];
  }) => {
    const printJobCard = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to print the job card",
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
            <title>Job Control - ${
              selectedJobCard?.JobCardNumber || "Print"
            }</title>
            ${printStyles}
          </head>
          <body>
             <div class="header-container">
              <div class="header">JOB CONTROL MASTER</div>
              <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${
                selectedJobCard?.JobCardNumber
              }" alt="QR Code">
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

    // Function to get appropriate icon based on file extension
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

    // Function to handle file download
    const handleFileDownload = (filePath: string) => {
      const fullUrl = `${BACKEND_URL}/${filePath}`;
      window.open(fullUrl, "_blank");
    };

    // Split the image paths
    const documentPaths = jobCard.Image ? jobCard.Image.split(",") : [];

    return (
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Job Control Preview - {jobCard.JobCardNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="border p-4 my-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div id="job-card-print-content" className="border border-gray-800">
            {/* <div className="text-center bg-gray-100 font-bold text-xl border-b border-gray-800 py-2">
              JOB CARD
            </div> */}

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">
                    Label Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 font-semibold">
                    {jobCard.LabelType}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 w-1/4 bg-gray-100">
                    Job Control No
                  </td>
                  <td className="border border-gray-800 px-2 py-1 w-1/4 text-red-600 font-semibold">
                    {jobCard.JobCardNumber}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Customer Name
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.CompanyName}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Job Description
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.JobDescription}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Material Code
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.MatCode}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Material Web
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.MaterialWeb}
                  </td>
                </tr>

                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Material Description
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.MatDesc}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Lamination Material / Varnish
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.LaminationMaterial || "NA"}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Foil Material Code
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.FoilMaterialCode || "NA"}
                  </td>
                </tr>

                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Special Characteristics
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.SpecialCharacteristic || "-"}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Artwork No.
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.ArtworkNo || "-"}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Machine
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.Machine || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Thermal Printing Required
                  </td>
                  <td
                    className="border border-gray-800 px-2 py-1 font-semibold"
                    colSpan={3}
                  >
                    {jobCard.ThermalPrintingRequired || "-"}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Ribbon Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.RibbonType || "-"}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Alternative Ribbon Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.AltRibbonType || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Customer Part No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.CustomerPartNumber}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Size
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">{`${jobCard.Width}X${jobCard.Height}`}</td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Cylinder Teeth
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">
                    {jobCard.CylinderCode || ""}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Ups Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.UpsAcross || "1"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Supply Form
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.SupplyForm}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Ups Along
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.UpsAlong}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Winding Direction
                  </td>
                  {/* <td className="border border-gray-800 px-2 py-1 font-semibold">{jobCard.WindingDirection}</td> */}
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    <img
                      className="winding-image"
                      src={getWindingImagePath(jobCard.WindingDirection)}
                      alt="Winding Image"
                    />
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Gap Across
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.GapAcross || "1"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Foiling
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.FoilMaterialCode}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Gap Along
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.GapAlong}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Die No.
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">
                    {jobCard.DieNumber}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100 ">
                    Die Type
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">
                    {jobCard.DieType}
                  </td>
                </tr>
                <tr className="">
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Plate Folder Number
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">
                    {jobCard.PlateFolderNo || "-"}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Slitting Ups
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold ">
                    {jobCard.Ups || "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Core Dia
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.Core}
                  </td>
                  <td className="border border-gray-800 font-bold px-2 py-1 bg-gray-100">
                    Number of labels per roll
                  </td>
                  <td className="border border-gray-800 px-2 py-1 font-semibold">
                    {jobCard.NumberOfLabel}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Only show color sequence for PP label type */}
            {jobCard.LabelType === "PP" &&
              colorSequence &&
              colorSequence.length > 0 && (
                <div className="mt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th
                          className="border border-gray-800 font-bold px-2 py-1 text-center"
                          colSpan={4}
                        >
                          Color Sequence
                        </th>
                      </tr>
                      <tr>
                        <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">
                          Unit No
                        </th>
                        <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">
                          Color
                        </th>
                        <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">
                          Anilox
                        </th>
                        <th className="border border-gray-800 font-bold px-2 py-1 w-1/4">
                          BCM
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {colorSequence.map(
                        (color: ColorSequenceData, index: number) => (
                          <tr key={index}>
                            <td className="border border-gray-800 px-2 py-1 text-center">
                              {color.ColorSequence}
                            </td>
                            <td className="border border-gray-800 px-2 py-1 text-center">
                              {color.Color}
                            </td>
                            <td className="border border-gray-800 px-2 py-1 text-center">
                              {color.Anilox}
                            </td>
                            <td className="border border-gray-800 px-2 py-1 text-center">
                              {color.BCM}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

          {/* Document attachments section */}
          {documentPaths.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Attachments</h3>
              <div className="overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {documentPaths.map((path, index) => {
                    const fileName = path.trim().split("/").pop() || "";
                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 whitespace-nowrap"
                        onClick={() => handleFileDownload(path.trim())}
                      >
                        {getFileIcon(fileName)}
                        <span className="max-w-[150px] truncate">
                          {fileName}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button onClick={printJobCard} className="flex items-center gap-2">
            <Printer size={16} /> Print Job Card
          </Button>
        </div>
      </DialogContent>
    );
  };

 const handleEdit = (data: JobCardReportData) => {
  setCompanyName(data.CompanyName || "");
  setJobDescription(data.JobDescription || "");
  setLabelType(data.LabelType || "");
  setHeight(data.Height || "");
  setWidth(data.Width || "");
  setUnit(data.Unit || "");
  setUps(data.Ups || "");
  setCore(data.Core || "");
  setRawMaterial(data.MatCode || "");
  setRawMaterialDesc(data.MatDesc || "");
  setLaminationMaterial(data.LaminationMaterial || "");
  setFoilMaterialCode(data.FoilMaterialCode || "");
  setUpsAcross(data.UpsAcross || "");
  setUpsAlong(data.UpsAlong || "");
  setGapAcross(data.GapAcross || "");
  setGapAlong(data.GapAlong || "");
  setNumberOfLabels(data.NumberOfLabel || "");
  setCustomerPartNumber(data.CustomerPartNumber || "");
  setSupplyForm(data.SupplyForm || "");
  setThermalPrintingRequired(data.ThermalPrintingRequired || "");
  setRibbonType(data.RibbonType || "");
  setSpecialCharacteristic(data.SpecialCharacteristic || "");
  setArtworkNo(data.ArtworkNo || "");
  setOldProductCode(data.OldProductCode || "");
  setJobCardNumber(data.JobCardNumber || "");
  setJcSerialNumber(data.JcSerialNumber || "");
  setDieType(data.DieType || "");
  setDieNumber(data.DieNumber || "");
  setAlternateRibbonType(data.AltRibbonType || "");
setCutPerforation(data.CutPerforation || "");
  setMachine(data.Machine || "");
  setColorNo(data.ColorNo || "");
  setPaperType(data.PaperType || "");
  setBlockNo(data.BlockNo || "");
  setWindingDirection(data.WindingDirection || "");
  setLabelDescription(data.LabelDescription || "");
  setImage(data.Image || "");
  setCylinderCode(data.CylinderCode || "");
  setMaterialWeb(data.MaterialWeb || "");
  setPlateFolderNo(data.PlateFolderNo || "");
  setCylinderCode(data.CylinderCode||"")
  // Handle company address setting properly
  const found = customers.find((c) => c.Company === data.CompanyName);
  
  if (found) {
    setAddresses([found.Address]);
    // Use setTimeout to ensure addresses are set before setting the selected value
    setTimeout(() => {
      setCompanyAddress(data.CompanyAddress || found.Address);
    }, 0);
  } else {
    setAddresses([]);
    setCompanyAddress("");
  }

  setEditMode(true);
};

  console.log("this is to company address",companyAddress)
const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!companyAddress) {
    toast({
      title: "Error",
      description: "Company Address is required",
      variant: "destructive",
    });
    setCompanyAddressError(false);
    return;
  }

  const payload = {
    CompanyName: companyName,
    CompanyAddress: companyAddress,
    JobDescription: jobDescription,
    LabelType: labelType,
    Height: height,
    Width: width,
    Unit: unit,
    Ups: ups,
    Core: core,
    CutPerforation: cutPerforation, 
    MatCode: rawMaterial,
    MatDesc: rawMaterialDesc,
    DieType: dieType,
    DieNumber: dieNumber,
    LaminationMaterial: laminationMaterial,
    FoilMaterialCode: foilMaterialCode,
    SpecialCharacteristic: specialCharacteristic,
    JobCardNumber: jobCardNumber,
    JcSerialNumber: jcSerialNumber,
    Machine: machine, 
    ColorNo: colorNo,
    PaperType: paperType,
    UpsAcross: upsAcross,
    UpsAlong: upsAlong,
    GapAcross: gapAcross,
    GapAlong: gapAlong,
    NumberOfLabel: numberOfLabels,
    CustomerPartNumber: customerPartNumber,
    BlockNo: blockNo,
    SupplyForm: supplyForm,
    WindingDirection: windingDirection,
    LabelDescription: labelDescription,
    Image: image,
    OldProductCode: oldProductCode,
    CylinderCode: cylinderCode,
    MaterialWeb: materialWeb,
    PlateFolderNo: plateFolderNo,
    ThermalPrintingRequired: thermalPrintingRequired,
    RibbonType: ribbonType,
    AltRibbonType: alternateRibbonType,
    ArtworkNo: artworkNo,
    ModifiedBy: getUserID()
  };

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/master/get-job-card-update`,
      payload
    );

    if (response.data.success) {
      toast({
        title: "Success",
        description: `Success: ${response.data.message}`
      });
      handleClear(); // Resets form
    } else {
      toast({
        title: "Error",
        description: `Error: ${response.data.message}`,
        variant: "destructive"
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: "Failed to update job card",
      variant: "destructive"
    });
  }
};



  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>
            Job Control Master{" "}
            <span className="font-normal text-sm text-muted-foreground">
              (* Fields Are Mandatory)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleUpdate}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Customer Name */}
                <div className="space-y-2">
                  <Label>Customer Name*</Label>
                  <CustomDropdown
                    options={Array.from(new Set(customers.map((c) => c.Company))).map((company) => ({
                      value: company,
                      label: company,
                    }))}
                    value={companyName}
                    onValueChange={setCompanyName}
                    placeholder="Select Customer"
                    emptyText="No Customer Found"
                    searchPlaceholder="Search Customer"
                  />
                </div>
                {/* Customer Address */}
                <div className="space-y-2">
                  <Label className={!CompanyAddressError ? "text-red-500" : ""}>Customer Address*</Label>
                  <CustomDropdown
                    options={addresses.map((a) => ({
                      value: a,
                      label: a,
                    }))}
                    value={companyAddress}
                    onValueChange={setCompanyAddress}
                    placeholder="Select Address"
                    emptyText="No Address Found"
                    searchPlaceholder="Search Address"
                  />
                  {!CompanyAddressError && ( <div className="text-sm text-destructive">Select Address</div> )}
                  
                </div>
                {/* Job Description */}
                <div className="space-y-2">
                  <Label>Job Description</Label>
                  <Input value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled/>
                </div>
                {/* Label Type */}
                <div className="space-y-2">
                  <Label>Label Type*</Label>
                  <CustomDropdown
                    options={labelTypes.map((lt) => ({
                      value: lt.LtypeCode,
                      label: `${lt.LtypeCode} - ${lt.LtypeDes}`,
                    }))}
                    value={labelType}
                    onValueChange={setLabelType}
                    placeholder="Select Label Type"
                    emptyText="No Label Type Found"
                    searchPlaceholder="Search Label Type"
                  />
                </div>
                {/* Height */}
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Input value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                {/* Width */}
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input value={width} onChange={(e) => setWidth(e.target.value)} />
                </div>
                {/* Unit */}
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} />
                </div>
                {/* Slitting Ups */}
                <div className="space-y-2">
                  <Label>Slitting Ups</Label>
                  <Select value={ups} onValueChange={setUps}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                          {(i + 1).toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Core */}
                <div className="space-y-2">
                  <Label>Core (inch)</Label>
                  <Select value={core} onValueChange={setCore}>
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
                </div>
                {/* Raw Material */}
                <div className="space-y-2">
                  <Label>Raw Material</Label>
                  <CustomDropdown
                    options={rawMaterials.map((rm) => ({
                      value: rm.RawMatCode,
                      label: rm.RawMatCode,
                    }))}
                    value={rawMaterial}
                    onValueChange={setRawMaterial}
                    placeholder="Select Raw Material"
                    emptyText="No Raw Material Found"
                    searchPlaceholder="Search Raw Material"
                  />
                </div>
                {/* Raw Material Description */}
                <div className="space-y-2">
                  <Label>Raw Material Description</Label>
                  <Input value={rawMaterialDesc} disabled />
                </div>
                {/* Lamination Material */}
                <div className="space-y-2">
                  <Label>Lamination Material / Varnish</Label>
                  <Input value={laminationMaterial} onChange={(e) => setLaminationMaterial(e.target.value)} />
                </div>
                {/* Foil Material Code */}
                <div className="space-y-2">
                  <Label>Foil Material Code</Label>
                  <Input value={foilMaterialCode} onChange={(e) => setFoilMaterialCode(e.target.value)} />
                </div>
                  <div className="space-y-2">
                  <Label>Cylinder Teeth</Label>
                  <Input value={cylinderCode} onChange={(e) => setCylinderCode(e.target.value)} />
                </div>
                {/* Ups Across */}
                <div className="space-y-2">
                  <Label>Ups Across</Label>
                  <Input value={upsAcross} onChange={(e) => setUpsAcross(e.target.value)} />
                </div>
                {/* Ups Along */}
                <div className="space-y-2">
                  <Label>Ups Along</Label>
                  <Input value={upsAlong} onChange={(e) => setUpsAlong(e.target.value)} />
                </div>
                {/* Gap Across */}
                <div className="space-y-2">
                  <Label>Gap Across</Label>
                  <Input value={gapAcross} onChange={(e) => setGapAcross(e.target.value)} />
                </div>
                {/* Gap Along */}
                <div className="space-y-2">
                  <Label>Gap Along</Label>
                  <Input value={gapAlong} onChange={(e) => setGapAlong(e.target.value)} />
                </div>
                {/* Number of labels per roll */}
                <div className="space-y-2">
                  <Label>Number of labels per roll</Label>
                  <Input value={numberOfLabels} onChange={(e) => setNumberOfLabels(e.target.value)} />
                </div>
                {/* Customer Part Number */}
                <div className="space-y-2">
                  <Label>Customer Part Number</Label>
                  <Input value={customerPartNumber} onChange={(e) => setCustomerPartNumber(e.target.value)} />
                </div>
                {/* Supply Form */}
                <div className="space-y-2">
                  <Label>Supply Form</Label>
                  <Input value={supplyForm} onChange={(e) => setSupplyForm(e.target.value)} />
                </div>
                {/* Thermal Printing Required */}
                <div className="space-y-2">
                  <Label>Thermal Printing Required</Label>
                  <Input value={thermalPrintingRequired} onChange={(e) => setThermalPrintingRequired(e.target.value)} />
                </div>
                {/* Ribbon Type */}
                <div className="space-y-2">
                  <Label>Ribbon Type</Label>
                  <Input value={ribbonType} onChange={(e) => setRibbonType(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alternative Ribbon Type</Label>
                  <Input value={alternateRibbonType} onChange={(e) => setAlternateRibbonType(e.target.value)} />
                </div>
                {/* Special Characteristic */}
                <div className="space-y-2">
                  <Label>Special Characteristic</Label>
                  <Input value={specialCharacteristic} onChange={(e) => setSpecialCharacteristic(e.target.value)} />
                </div>
                {/* Artwork No */}
                <div className="space-y-2">
                  <Label>Artwork No.</Label>
                  <Input value={artworkNo} onChange={(e) => setArtworkNo(e.target.value)} />
                </div>
                {/* Old Product Code */}
                <div className="space-y-2">
                  <Label>Old Product Code</Label>
                  <Input value={oldProductCode} onChange={(e) => setOldProductCode(e.target.value)} disabled/>
                </div>
                {/* Die Type */}
                <div className="space-y-2">
                  <Label>Die Type</Label>
                  <Input value={dieType} onChange={(e) => setDieType(e.target.value)} />
                </div>
                {/* Die Number */}
                <div className="space-y-2">
                  <Label>Die Number</Label>
                  <Input value={dieNumber} onChange={(e) => setDieNumber(e.target.value)} />
                </div>
                {/* JobCardNumber (hidden from editing if needed) */}
                <div className="space-y-2">
                  <Label>Job Card Number</Label>
                  <Input value={jobCardNumber} disabled />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="submit" onClick={handleUpdate} disabled={!editMode}>Update</Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  Cancel
                </Button>
              </div>
            </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {showTable &&
          (reportData.length > 0 ? (
            <Card className="mt-5">
              <CardHeader className="underline underline-offset-4 text-center">
                Edit Job Control Master{" "}
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span>Show</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder={itemsPerPage.toString()} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TableSearch onSearch={handleSearch} />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Edit</TableHead>
                      <TableHead>Job Control No</TableHead>
                      <TableHead>Label Type</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Job Description</TableHead>
                      <TableHead>Material Code</TableHead>
                      <TableHead>Material Description</TableHead>
                      <TableHead>Height</TableHead>
                      <TableHead>Width</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Creation Date</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((row, idx) => (
                        <React.Fragment key={idx}>
                          <TableRow>
                            <TableCell>
                              <Button
                                variant="secondary"
                                //   size="sm"
                                //   className="flex items-center gap-1"
                                onClick={() => handleEdit(row)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                            <TableCell>{row.JobCardNumber}</TableCell>
                            <TableCell>{row.LabelType}</TableCell>
                            <TableCell>{row.CompanyName}</TableCell>
                            <TableCell>{row.JobDescription}</TableCell>
                            <TableCell>{row.MatCode}</TableCell>
                            <TableCell className="min-w-[300px]">
                              {row.MatDesc}
                            </TableCell>
                            <TableCell>{row.Height}</TableCell>
                            <TableCell>{row.Width}</TableCell>
                            <TableCell>{row.Unit}</TableCell>
                            <TableCell>
                              {row.CreatedDate
                                ? new Date(row.CreatedDate).toLocaleDateString()
                                : ""}
                            </TableCell>
                            <TableCell>{row.CreatedBy}</TableCell>
                            <TableCell>{row.ApprovedBy}</TableCell>
                            <TableCell>
                              {row.ApprovedDate
                                ? new Date(
                                    row.ApprovedDate
                                  ).toLocaleDateString()
                                : ""}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() =>
                                  handlePreviewClick({ jobCard: row })
                                }
                              >
                                <Eye size={16} /> Preview
                              </Button>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center">
                          No Data Found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center text-sm md:text-md mt-4">
                  <div>
                    {filteredData.length > 0
                      ? `Showing ${
                          (currentPage - 1) * itemsPerPage + 1
                        } to ${Math.min(
                          currentPage * itemsPerPage,
                          filteredData.length
                        )} of ${filteredData.length} entries`
                      : "No entries to show"}
                  </div>
                  {filteredData.length > 0 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 &&
                              pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={pageNumber}>
                                <PaginationLink
                                  isActive={pageNumber === currentPage}
                                  onClick={() => setCurrentPage(pageNumber)}
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            pageNumber === currentPage - 2 ||
                            pageNumber === currentPage + 2
                          ) {
                            return <PaginationEllipsis key={pageNumber} />;
                          }
                          return null;
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <NoDataCard />
          ))}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          {selectedJobCard && (
            <JobCardPreviewDialog
              jobCard={selectedJobCard}
              colorSequence={
                colorSequenceData[selectedJobCard.JobCardNumber] || []
              }
            />
          )}
        </Dialog>
      </div>
    </>
  );
};

export default JobControlMasterEdit;
