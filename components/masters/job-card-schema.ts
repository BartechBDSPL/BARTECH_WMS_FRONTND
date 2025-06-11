import { z } from 'zod';

// Define color entry schema
const colorEntrySchema = z.object({
  color: z.string().optional(),
  anilox: z.string().optional(),
  bcm: z.string().optional(),
});

export const jobCardSchema = z.object({
  company: z.string().min(1, { message: "Company name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  jobDescription: z.string().min(1, { message: "Job description is required" }),
  labelType: z.string().min(1, { message: "Label type is required" }),
  paperType: z.string().optional(),
  width: z.string().min(1, { message: "Width is required" }).refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000;
  }, { message: "Width must be a positive number less than or equal to 1000" }),
  height: z.string().min(1, { message: "Height is required" }).refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 1000;
  }, { message: "Height must be a positive number less than or equal to 1000" }),
  ups: z.string().min(1, { message: "Ups is required" }),
  upsAcross: z.string().min(1, {message: "Ups Accross is required"}),
  upsAlong: z.string().min(1, {message: "Ups Along is required"}),
  gapAcross: z.string().optional(),
  gapAlong: z.string().optional(),
  numberOfLabels: z.string().optional(),
  core: z.string().optional(),
  cut: z.string().min(1, { message: "Cut is required" }),
  materialWeb: z.string().min(1, {message: "Material web is required"}),
  perforation: z.string().min(1, { message: "Perforation is required" }),
  rawMaterial: z.string().min(1, {message: "Raw material is required"}),
  dieType: z.string().min(1, { message: "Die type is required" }),
  cylinderCode: z.string().min(1, { message: "Die type is required" }),
  dieNumber: z.string().optional(),
  laminationMaterial: z.string().min(1, { message: "Lamination Material Varnish is required" }),
  foilMaterialCode: z.string().min(1, { message: "Foil Material code is required" }),
  specialCharacteristic: z.string().optional(),
  machines: z.string().optional(),
  oldProductCode: z.string().optional(), // Make sure it's defined as optional if it can be empty
  colors: z.array(colorEntrySchema).optional(),
  customerPartNo: z.string().optional(),
  blockNo: z.string().optional(),
  supplyForm: z.string().optional(),
  windingDirection: z.string().optional(),
  thermalPrintingRequired: z.string().optional(),
  ribbontype: z.string().optional(),  
  
  plateFolderNumber: z.string().optional(),

  artWorkNo: z.string().optional(),

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
  Shift: z.string().optional(),
  Machine: z.string().optional(),
  NoOfRolls: z.string().optional(),
  LabelPerRoll: z.string().optional(),
  CoreSize: z.string().optional(),
  WindingDirection: z.string().optional(),
  NoOfLabelProduced: z.string().optional(),
  Wastage: z.string().optional(),
  settingStartTimeFinishing: z.date().optional(),
  settingEndTimeFinishing: z.date().optional(),
  productionStartTimeFinishing: z.date().optional(),
  productionEndTimeFinishing: z.date().optional(),

  // this is to new end code Finishing -----------------------------------
  ribbonsSize: z.string().optional(),
  alternateRibbonType: z.string().optional(),




});

export type JobCardSchema = z.infer<typeof jobCardSchema>;
