"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValue = exports.firestore = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize the Firebase Admin SDK
(0, app_1.initializeApp)();
// Export a Firestore instance
exports.firestore = (0, firestore_1.getFirestore)();
exports.FieldValue = firestore_1.FieldValue;
//# sourceMappingURL=firebase-admin.js.map