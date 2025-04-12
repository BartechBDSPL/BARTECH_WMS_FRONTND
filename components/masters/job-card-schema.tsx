import { z } from "zod";

// Define a schema for each color in the color sequence
const colorSchema = z.object({
  color: z.string().optional(),
  anilox: z.string().optional(),
  bcm: z.string().optional(),
});

// Define the job card schema with all required and optional fields
export const jobCardSchema = z.object({
  // Required fields with validation
  company: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  labelType: z.string().min(1, "Label type is required"),

  
  
  // Optional fields
  paperType: z.string().optional(),
  
  // Dimension fields
  width: z.coerce.number().min(0.01, "Width must be greater than 0").optional(),
  height: z.coerce.number().min(0.01, "Height must be greater than 0").optional(),
  
  // Color sequence for PP labels
  colors: z.array(colorSchema).optional(),
  
  // Additional specifications
  ups: z.string().min(1, "Ups is required"),
  core: z.string().min(1, { message: "Core is required" }),
  cut: z.string().min(1, "Cut is required"),
  perforation: z.string().min(1, "Perforation is required"),
  rawMaterial: z.string().min(1, "Raw material is required"),
  dieType: z.string().min(1, { message: "Die type is required" }),
  dieNumber: z.string().min(1, { message: "Die type is required" }),
  laminationMaterial: z.string().min(1, { message: "Lamination Material Varnish is required" }),
  foilMaterialCode: z.string().min(1, { message: "Foil Material code is required" }),
  specialCharacteristic: z.string().min(1, {message: "Special Characteristic is required"}),
  machines: z.string().min(1, {message: "Machines is required"}),
  
  // Additional fields
  upsAcross: z.string().min(1, {message: "Ups Accross is required"}),
  upsAlong: z.string().min(1, {message: "Ups Along is required"}),
  gapAcross: z.string().min(1, {message: "Gap Accross is required"}),
  gapAlong: z.string().min(1, {message: "Gap Along is required"}),
  numberOfLabels: z.string().min(1, {message: "Number of Labels is required"}),
  customerPartNo: z.string().min(1, {message: "Customer Part Number is required"}),
  blockNo: z.string().optional(),
  supplyForm: z.string().min(1, {message: "Supply Form is required"}),
  windingDirection: z.string().min(1, {message: "winding Direction is required"}),
  thermalPrintingRequired: z.string().min(1, {message: "Thermal Printing is required"}),
  ribbontype: z.string().min(1, {message: "Ribbon Type is required"}),
  plateFolderNumber: z.string().min(1, {message: "Plate Folder Number is required"}),
  materialWeb: z.string().min(1, { message: "Material web is required"}),
  cylinderCode: z.string().min(1, { message: "Cylinder Teeth is required" }),
  oldProductCode: z.string().min(1, { message: "Old Product Code is required" }),

  artWorkNo: z.string().min(1, { message: "Artwork Number is required" }),


  // this is to new start code -----------------------------------
  jobDate: z.date().optional(),
  jcNumber: z.string().optional(),
  jcDescription: z.string().optional(),
  Quantity: z.string().optional(),
  MetersOfRuns: z.string().optional(),
  Operator: z.string().optional(),
  settingStartTime: z.date().optional(),
  settingEndTime: z.date().optional(),
  productionStartTime: z.date().optional(),
  productionEndTime: z.date().optional(),

  // this is to new end code Punching -----------------------------------
  settingStartTimeOne: z.date().optional(),
  settingEndTimeOne: z.date().optional(),
  productionStartTimeOne: z.date().optional(),
  productionEndTimeOne: z.date().optional(),
  machinePunching: z.string().optional(),
});

export type JobCardSchema = z.infer<typeof jobCardSchema>;
