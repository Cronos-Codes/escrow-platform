import { z } from 'zod';
export declare const phoneOtpSchema: z.ZodObject<{
    phoneNumber: z.ZodString;
    otpCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    otpCode: string;
    phoneNumber: string;
}, {
    otpCode: string;
    phoneNumber: string;
}>;
export type PhoneOtpInput = z.infer<typeof phoneOtpSchema>;
//# sourceMappingURL=phoneOtpSchema.d.ts.map