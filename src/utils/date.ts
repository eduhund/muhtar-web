export const dateFormat = "DD MMMM YYYY";

export function dateOnlyISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}
