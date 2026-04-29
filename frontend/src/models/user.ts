/**
 * Based on the user display name, it extracts the initials and uses that for the image
 * @param name The user display name
 */
export const getDefaultAvatar = (name: string): string => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <circle cx="50" cy="50" r="50" fill="#f5a623"/>
        <text x="50" y="65" font-family="sans-serif" font-size="36" font-weight="bold" fill="#1a1a1a" text-anchor="middle">${initials}</text>
    </svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
}