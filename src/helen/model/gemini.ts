export default {
  // Remove ![chat]
  // Remove first level > and any whitespace
  prepareMessage(message: string): {role: string, parts: string} {
    message = message.replace(/\[!chat\]\s?/g, '')
    message = message.replace(/^\s?>/gm, '')
    return {
      role: 'user',
      parts: message
    }
  }
}