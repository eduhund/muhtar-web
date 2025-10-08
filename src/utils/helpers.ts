export function defaultListSort(optionA: any, optionB: any): number {
  return (optionA?.value ?? "")
    .toLowerCase()
    .localeCompare((optionB?.value ?? "").toLowerCase());
}
