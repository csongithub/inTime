const colors = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'blue-grey',
  'grey',
]

export function getAvatarColor(name) {
  if (!name) return 'primary'

  const firstChar = name.charAt(0).toUpperCase()
  const charCode = firstChar.charCodeAt(0)
  const index = charCode % colors.length

  return colors[index]
}

export function randomColor(name) {
  if (!name) return 'primary'

  const firstChar = name.charAt(0).toUpperCase()
  const charCode = firstChar.charCodeAt(0)
  const index = charCode % colors.length

  return colors[index]
}

export function getPrefixFromName(name) {
  if (!name) return ''

  // Remove special characters except spaces
  const cleaned = name.replace(/[^a-zA-Z0-9 ]/g, '').trim()

  const words = cleaned.split(/\s+/)

  let prefix = ''

  if (words.length > 1) {
    // Take first letter of each word
    prefix = words.map((word) => word.charAt(0)).join('')
  } else {
    // Single word → take first 4 characters
    prefix = words[0].substring(0, 4)
  }

  return prefix.toUpperCase()
}
