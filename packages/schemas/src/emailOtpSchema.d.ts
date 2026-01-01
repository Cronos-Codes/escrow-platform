import { z } from 'zod';
export declare const emailOtpSchema: z.ZodObject<{
    email: z.ZodString;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    otpCode: string;
}, {
    email: string;
    otpCode: string;
}>;
export type EmailOtpInput = z.infer<typeof emailOtpSchema>;
//# sourceMappingURL=emailOtpSchema.d.ts.map