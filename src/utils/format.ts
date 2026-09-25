/**
 * Aura Vega TV - Formatting Utilities
 */

export function formatTime(date: Date = new Date()): { time: string; period: string } {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return {
    time: `${hours}:${minutesStr}`,
    period,
  };
}

export function formatDate(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatTemp(tempFahrenheit: number, unit: 'F' | 'C' = 'F'): string {
  if (unit === 'C') {
    const celsius = Math.round(((tempFahrenheit - 32) * 5) / 9);
    return `${celsius}°C`;
  }
  return `${Math.round(tempFahrenheit)}°F`;
}
