import { z } from "zod";

export const otpRequestSchema = z.object({
  email: z.string().email(),
});

export const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
});

export const ticketCreateSchema = z.object({
  description: z.string().min(8).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  location: z.object({
    latitude: z.number().gte(-90).lte(90),
    longitude: z.number().gte(-180).lte(180),
    address: z.string().min(5),
    zoneId: z.string().uuid(),
  }),
});

export const ticketTransitionSchema = z.object({
  status: z.enum([
    "DRAFT",
    "OTP_VERIFIED",
    "CREATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "SLA_BREACHED",
    "ESCALATED",
    "REASSIGNED",
    "RESOLVED",
    "REOPENED",
    "CLOSED",
  ]),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
