export function getResourceName({ type }: { type: string }) {
  const resourceNames: { [key: string]: string } = {
    time: "Time",
  };

  return resourceNames[type] || "Unknown Resource";
}

export function getResourceValue({
  type,
  value,
}: {
  type: string;
  value: number;
}) {
  if (type === "time") {
    return Math.floor(value / 60);
  }
  return value;
}
