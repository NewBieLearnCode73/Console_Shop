export function generateSlugByName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
}
