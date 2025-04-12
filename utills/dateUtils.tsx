// dateUtils.tsx
export const formatDateToDDMMYY = (dateString: string): string => {
    const date = new Date(dateString);
    
    // Extract day, month, year
    const day = String(date.getUTCDate()).padStart(2, "0"); // Use UTC to match the Z timezone
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = String(date.getUTCFullYear()).slice(-4); // Last 2 digits of year
    
    // Extract hours and minutes
    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    
    // Convert to 12-hour format
    hours = hours % 12 || 12; // Convert 0 to 12 for midnight/noon
    
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };