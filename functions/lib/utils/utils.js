"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateToISO = void 0;
const formatDateToISO = (date) => {
    const offset = date.getTimezoneOffset();
    const dateUTC = new Date(date.getTime() - offset * 60000);
    return dateUTC.toISOString().split('T')[0];
};
exports.formatDateToISO = formatDateToISO;
//# sourceMappingURL=utils.js.map