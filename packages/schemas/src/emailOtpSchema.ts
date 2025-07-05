import { z } from 'zod';

export const emailOtpSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
  otpCode: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export type EmailOtpInput = z.infer<typeof emailOtpSchema>; 