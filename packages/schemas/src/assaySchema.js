"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.METAL_PURITY_THRESHOLDS = exports.batchRevocationSchema = exports.assayVerificationSchema = exports.assaySchema = void 0;
const zod_1 = require("zod");
exports.assaySchema = zod_1.z.object({
    batchId: zod_1.z.string().min(1, 'Batch ID is required'),
    metalType: zod_1.z.enum(['gold', 'silver', 'platinum', 'palladium', 'rhodium'], {
        errorMap: () => ({ message: 'Metal type must be one of: gold, silver, platinum, palladium, rhodium' })
    }),
    purity: zod_1.z.number().min(0).max(100, 'Purity must be between 0 and 100'),
    weight: zod_1.z.number().positive('Weight must be positive'),
    assayer: zod_1.z.string().min(1, 'Assayer information is required'),
    certificateUri: zod_1.z.string().url('Certificate URI must be a valid URL'),
    origin: zod_1.z.string().min(1, 'Origin information is required'),
    timestamp: zod_1.z.string().datetime('Timestamp must be a valid ISO date string'),
    verified: zod_1.z.boolean().default(false),
});
exports.assayVerificationSchema = zod_1.z.object({
    batchId: zod_1.z.string().min(1, 'Batch ID is required'),
});
exports.batchRevocationSchema = zod_1.z.object({
    batchId: zod_1.z.string().min(1, 'Batch ID is required'),
    reason: zod_1.z.string().min(1, 'Revocation reason is required'),
});
// Metal type specific purity thresholds
exports.METAL_PURITY_THRESHOLDS = {
    gold: 99.9,
    silver: 99.9,
    platinum: 99.95,
    palladium: 99.95,
    rhodium: 99.9,
};
//# sourceMappingURL=assaySchema.js.map