"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.FieldValue = exports.FIRESTORE_DB_NAME = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
exports.FIRESTORE_DB_NAME = process.env.FIRESTORE_DB_NAME || undefined;
// Initialize the Firebase Admin SDK
const app = (0, app_1.initializeApp)();
// Export a Firestore instance
exports.FieldValue = firestore_1.FieldValue;
exports.firestore = exports.FIRESTORE_DB_NAME !== undefined ?
    (0, firestore_1.getFirestore)(app, exports.FIRESTORE_DB_NAME) :
    (0, firestore_1.getFirestore)(app);
//# sourceMappingURL=firebase-admin.js.map