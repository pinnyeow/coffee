import { z } from 'zod'

// Brew form validation. Kept out of the 'use server' actions file so it can be unit tested.

export const UpdateBrewSchema = z.object({
  dose_g: z.coerce.number().positive().max(100),
  water_ml: z.coerce.number().int().positive().max(2000).optional().or(z.literal('').transform(() => undefined)),
  grind_xbloom: z.coerce.number().min(1).max(100).optional().or(z.literal('').transform(() => undefined)),
  rpm_xbloom: z.coerce.number().int().min(1).max(200).optional().or(z.literal('').transform(() => undefined)),
  water_temp_c: z.coerce.number().min(60).max(100).optional().or(z.literal('').transform(() => undefined)),
  time_str: z.string().optional().transform((v) => v?.trim() || ''),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().transform((v) => v?.trim() || null),
  is_best: z
    .union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
  is_private: z
    .union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
})

export const BrewInputSchema = z.object({
  bean_name: z.string().min(1, 'Bean name required').max(120),
  roaster: z.string().max(120).optional().transform((v) => v?.trim() || null),
  origin: z.string().max(120).optional().transform((v) => v?.trim() || null),
  purchased_country: z.string().max(80).optional().transform((v) => v?.trim() || null),
  purchased_city: z.string().max(80).optional().transform((v) => v?.trim() || null),
  purchased_at: z.string().max(120).optional().transform((v) => v?.trim() || null),
  dose_g: z.coerce.number().positive().max(100),
  water_ml: z.coerce.number().int().positive().max(2000).optional().or(z.literal('').transform(() => undefined)),
  grind_xbloom: z.coerce.number().min(1).max(100).optional().or(z.literal('').transform(() => undefined)),
  rpm_xbloom: z.coerce.number().int().min(1).max(200).optional().or(z.literal('').transform(() => undefined)),
  water_temp_c: z.coerce.number().min(60).max(100).optional().or(z.literal('').transform(() => undefined)),
  time_str: z.string().optional().transform((v) => v?.trim() || ''),
  rating: z.coerce.number().int().min(1).max(5),
  notes: z.string().max(2000).optional().transform((v) => v?.trim() || null),
  derived_from_brew_id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  is_private: z
    .union([z.literal('on'), z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
})
