import { z } from "zod";

// Define a schema for each color in the color sequence
const colorSchema = z.object({
  color: z.string().optional(),
  anilox: z.string().optional(),
  bcm: z.string().optional(),
});

// Define the job card schema with all required and optional fields
export const jobCardControlSchema = z.object({
  // Required fields with validation
  company: z.string().optional(),
  address: z.string().optional(),
  jobDescription: z.string().optional(),
  labelType: z.string().optional(),
  paperType: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  ups: z.string().optional(),
  upsAcross: z.string().optional(),
  upsAlong: z.string().optional(),
  gapAcross: z.string().optional(),
  gapAlong: z.string().optional(),
  numberOfLabels: z.string().optional(),
  core: z.string().optional(),
  cut: z.string().optional(),
  materialWeb: z.string().optional(),
  perforation: z.string().optional(),
  rawMaterial: z.string().optional(),
  dieType: z.string().optional(),
  cylinderCode: z.string().optional(),
  dieNumber: z.string().optional(),
  laminationMaterial: z.string().optional(),
  foilMaterialCode: z.string().optional(),
  specialCharacteristic: z.string().optional(),
  machines: z.string().optional(),
  oldProductCode: z.string().optional(),
  colors: z.array(colorSchema).optional(),
  customerPartNo: z.string().optional(),
  blockNo: z.string().optional(),
  supplyForm: z.string().optional(),
  windingDirection: z.string().optional(),
  thermalPrintingRequired: z.string().optional(),
  ribbontype: z.string().optional(),
  plateFolderNumber: z.string().optional(),
  soNO: z.string().optional(),
  

  // New fields
  jobDate: z.date().optional(),
  jcNumber: z.string().optional(),
  jcDescription: z.string().optional(),
  Quantity: z.string().optional(),
  MetersOfRuns: z.string().optional(),
  Operator: z.string().optional(),

  // Punching fields
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
});

export type JobCardControlSchema = z.infer<typeof jobCardControlSchema>;
