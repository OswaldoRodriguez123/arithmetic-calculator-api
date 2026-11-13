import { z } from "zod";

export const newRecordSchema = z.object({
  firstNumber: z.string().optional(),
  lastNumber: z.string().optional(),
  operation_id: z.string().min(1),
})

export const getAllSchema = z.object({
  page: z.string().regex(/^\d{1,5}$/, 'page must be a positive integer').refine((v) => Number(v) >= 1, 'page must be >= 1'),
  rowsPerPage: z.string().regex(/^\d{1,3}$/, 'rowsPerPage must be an integer between 1 and 100').refine((v) => {
    const n = Number(v);
    return n >= 1 && n <= 100;
  }, 'rowsPerPage must be an integer between 1 and 100'),
  sortField: z.string().optional(),
  sortOrder: z.string().optional(),
  search: z.string().max(200).optional(),
})