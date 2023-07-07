import { z } from "zod";

export const newRecordSchema = z.object({
  firstNumber: z.string().optional(),
  lastNumber: z.string().optional(),
  operation_id: z.string().min(1),
})

export const getAllSchema = z.object({
  page: z.string(),
  rowsPerPage: z.string(),
  sortField: z.string().optional(),
  sortOrder: z.string().optional(),
  search: z.string().optional(),
})