// A count with its noun in the right number: countOf(1, "inquiry", "inquiries") → "1 inquiry", 3 → "3 inquiries".
export function countOf(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}
