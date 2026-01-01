/**
 * @file Unified Authentication Validation Schemas
 * @description Centralized Zod schemas for all authentication flows
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Phone validation (E.164 format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Use E.164 format (e.g., +1234567890)');

// Wallet address validation (Ethereum)
export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Basic password (for login, less strict)
export const basicPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// OTP validation
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

// Login schemas
export const emailLoginSchema = z.object({
  email: emailSchema,
  password: basicPasswordSchema,
});

export const phoneLoginSchema = z.object({
  phone: phoneSchema,
  otpCode: otpSchema,
});

export const walletLoginSchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().optional(), // Optional for now, will be required for server-side verification
});

// Signup schemas
export const emailSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: nameSchema,
  lastName: nameSchema,
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const phoneSignupSchema = z.object({
  phone: phoneSchema,
  otpCode: otpSchema,
});

export const walletSignupSchema = z.object({
  walletAddress: walletAddressSchema,
});

// Credential linking schemas
export const linkEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(), // Optional if already authenticated
});

export const linkPhoneSchema = z.object({
  phone: phoneSchema,
  otpCode: otpSchema,
});

export const linkWalletSchema = z.object({
  walletAddress: walletAddressSchema,
});

// Password reset schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Type exports
export type EmailLoginInput = z.infer<typeof emailLoginSchema>;
export type PhoneLoginInput = z.infer<typeof phoneLoginSchema>;
export type WalletLoginInput = z.infer<typeof walletLoginSchema>;
export type EmailSignupInput = z.infer<typeof emailSignupSchema>;
export type PhoneSignupInput = z.infer<typeof phoneSignupSchema>;
export type WalletSignupInput = z.infer<typeof walletSignupSchema>;
export type LinkEmailInput = z.infer<typeof linkEmailSchema>;
export type LinkPhoneInput = z.infer<typeof linkPhoneSchema>;
export type LinkWalletInput = z.infer<typeof linkWalletSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;


