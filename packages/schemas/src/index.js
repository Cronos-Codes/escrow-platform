"use strict";
/**
 * @file Schemas Package for Escrow Platform
 * @description Zod validation schemas for all data structures
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeholder = exports.EscrowStateSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
// User schemas
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    walletAddress: zod_1.z.string().optional(),
    role: zod_1.z.enum(['buyer', 'seller', 'broker', 'admin', 'arbiter', 'sponsor']),
    kycStatus: zod_1.z.enum(['pending', 'verified', 'rejected']),
    createdAt: zod_1.z.number(),
    updatedAt: zod_1.z.number(),
});
// Escrow schemas
exports.EscrowStateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    status: zod_1.z.enum(['draft', 'funded', 'approved', 'released', 'disputed', 'resolved']),
    parties: zod_1.z.object({
        buyer: zod_1.z.string(),
        seller: zod_1.z.string(),
        broker: zod_1.z.string().optional(),
    }),
    amount: zod_1.z.string(),
    deadline: zod_1.z.number(),
    createdAt: zod_1.z.number(),
    updatedAt: zod_1.z.number(),
});
// Auth schemas
__exportStar(require("./emailOtpSchema"), exports);
__exportStar(require("./phoneOtpSchema"), exports);
__exportStar(require("./escrow"), exports);
__exportStar(require("./propertySchema"), exports);
__exportStar(require("./assaySchema"), exports);
__exportStar(require("./shipmentSchema"), exports);
// Dashboard schemas
__exportStar(require("./dashboard"), exports);
const placeholder = () => {
    console.log('Schemas package placeholder - Validation schemas to be expanded in subsequent phases');
};
exports.placeholder = placeholder;
//# sourceMappingURL=index.js.map