// Convert 24-hour time to 12-hour format with AM/PM
export function formatTimeTo12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Convert 12-hour time with AM/PM to 24-hour format
export function formatTimeTo24Hour(time12: string): string {
  if (!time12) return '';
  
  const match = time12.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time12;
  
  let [, hours, minutes, period] = match;
  let hours24 = parseInt(hours);
  
  if (period.toUpperCase() === 'PM' && hours24 !== 12) {
    hours24 += 12;
  } else if (period.toUpperCase() === 'AM' && hours24 === 12) {
    hours24 = 0;
  }
  
  return `${hours24.toString().padStart(2, '0')}:${minutes}`;
}

// Generate time options for 12-hour format
export function generateTimeOptions(): string[] {
  const times: string[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      times.push(`${hour12}:${minute.toString().padStart(2, '0')} ${period}`);
    }
  }
  
  return times;
}
