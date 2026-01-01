"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyVerificationSchema = exports.deedTokenizationSchema = exports.propertySchema = void 0;
const zod_1 = require("zod");
exports.propertySchema = zod_1.z.object({
    propertyId: zod_1.z.string().min(1, 'Property ID is required'),
    owner: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
    location: zod_1.z.string().min(1, 'Location is required'),
    coordinates: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
        lng: zod_1.z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
    }),
    size: zod_1.z.number().positive('Size must be positive'),
    valuation: zod_1.z.number().positive('Valuation must be positive'),
    zoning: zod_1.z.string().min(1, 'Zoning information is required'),
    documentUri: zod_1.z.string().url('Document URI must be a valid URL'),
    verified: zod_1.z.boolean().default(false),
});
exports.deedTokenizationSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, 'Deal ID is required'),
    propertyData: exports.propertySchema,
});
exports.propertyVerificationSchema = zod_1.z.object({
    dealId: zod_1.z.string().min(1, 'Deal ID is required'),
    signedDocHash: zod_1.z.string().min(1, 'Signed document hash is required'),
});
//# sourceMappingURL=propertySchema.js.map