"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailOtpSchema = void 0;
const zod_1 = require("zod");
exports.emailOtpSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .email('Invalid email format'),
    otpCode: zod_1.z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
});
//# sourceMappingURL=emailOtpSchema.js.map