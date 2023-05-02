"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.FieldValue = void 0;
const admin = require("firebase-admin");
// Initialize the Firebase Admin SDK
admin.initializeApp();
// Export a Firestore instance
exports.FieldValue = admin.firestore.FieldValue;
exports.firestore = admin.firestore();
//# sourceMappingURL=firebase-admin.js.map