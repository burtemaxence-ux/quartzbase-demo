export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getEstablishmentInitials(name: string): string {
  return name
    .split(' ')
    .filter(w => w.length > 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || name.slice(0, 2).toUpperCase()
}
