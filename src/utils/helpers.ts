export function defaultListSort(optionA: any, optionB: any): number {
  return (optionA?.label ?? "")
    .toLowerCase()
    .localeCompare((optionB?.label ?? "").toLowerCase());
}
