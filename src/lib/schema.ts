import { z } from 'zod'
import type { Content } from './types'

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Expected a hex color')

const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Only http and https links are allowed')

const linkItem = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  url: httpUrl,
  enabled: z.boolean(),
})

const socialItem = z.object({
  platform: z.enum(['instagram', 'x', 'youtube', 'tiktok', 'linkedin', 'github', 'email', 'website']),
  url: z
    .string()
    .trim()
    .min(1)
    .max(400)
    .refine((value) => /^(https?:\/\/|mailto:)/i.test(value), 'Use an http, https or mailto link'),
})

const profile = z.object({
  name: z.string().trim().max(120),
  bio: z.string().trim().max(280),
  avatarUrl: z.union([httpUrl, z.literal('')]),
  socials: z.array(socialItem).max(12),
})

const theme = z.object({
  backgroundType: z.enum(['solid', 'gradient', 'image']),
  bgColor1: hexColor,
  bgColor2: hexColor,
  gradientAngle: z.number().int().min(0).max(360),
  bgImageUrl: z.union([httpUrl, z.literal('')]),
  textColor: hexColor,
  buttonStyle: z.enum(['solid', 'outline', 'soft']),
  buttonColor: hexColor,
  buttonTextColor: hexColor,
  buttonRadius: z.number().int().min(0).max(40),
  font: z.enum(['system', 'serif', 'mono', 'rounded']),
  avatarShape: z.enum(['circle', 'rounded', 'square']),
})

export const contentSchema = z.object({
  profile,
  links: z.array(linkItem).max(100),
  theme,
})

export function parseContent(input: unknown): Content {
  return contentSchema.parse(input)
}
