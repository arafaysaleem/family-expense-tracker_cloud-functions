export const formatDateToISO = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const dateUTC = new Date(date.getTime() - offset * 60000);
  return dateUTC.toISOString().split('T')[0];
};
