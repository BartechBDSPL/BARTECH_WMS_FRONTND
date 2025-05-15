import { z } from 'zod';

export const softwareTrackingSchema = z.object({
  // Customer Details
  customerName: z.string().min(1, { message: "Customer Name is required" }),
  customerAddress: z.string().min(1, { message: "Customer Address is required" }),
  contactPerson: z.string().min(1, { message: "Contact Person is required" }),
  contactNo: z.string().min(1, { message: "Contact Number is required" }),
  emailID: z.string().email({ message: "Valid Email is required" }),

  invoicePONo: z.string().min(1, { message: "Invoice PO No is required" }),

  // Hardware Details
  softwareType: z.string().min(1, { message: "Hardware Type is required" }),
  ProjectTitle: z.string().min(1, { message: "Project Title is required" }),
  ProjectDesc: z.string().min(1, { message: "Project Description is required" }),
  ProjectVersion: z.string().min(1, { message: "Project Version is required" }),
  additionalDetails: z.string().optional(),

  dateOfWarrentyStart: z.date({ required_error: "Warranty Start Date is required" }),
  warrentyDays: z.number({ invalid_type_error: "Warranty Days must be a number" }).int().nonnegative(),
  warrentyStatus: z.enum(["AMC", "Warranty"], { message: "Warranty Status must be AMC or Warranty" }),

  qty: z.number({ invalid_type_error: "Qty must be a number" }).int().positive(),
  serialNo: z.string().min(1, { message: "Serial No is required" }),

  // Optional or derived fields
  uniqueSerialNo: z.string().optional(),
  dateOfWarrentyExp: z.date().optional(),

});

export type SoftwareTrackingSchema = z.infer<typeof softwareTrackingSchema>;
