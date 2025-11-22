export function splitNumber(num: number, size = 3, separator = " ") {
  const str = String(num);
  const reversed = str.split("").reverse().join("");

  const chunks = [];
  for (let i = 0; i < reversed.length; i += size) {
    chunks.push(reversed.slice(i, i + size));
  }

  return chunks
    .map((chunk) => chunk.split("").reverse().join(""))
    .reverse()
    .join(separator);
}

export function beautifyCurrency(num: number) {
  return `${splitNumber(num)}₽`;
}
