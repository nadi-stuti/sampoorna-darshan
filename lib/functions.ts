export function convertTo12HourFormat(time24: string) {
  // Split the input time into hours and minutes
  let [hours, minutes] = time24.split(":").map(Number);

  // Determine AM or PM
  let period = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12; // 0 becomes 12 in 12-hour format

  // Return the formatted time
  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
