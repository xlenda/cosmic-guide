// Remove caracteres invisíveis usados em spoofing visual de texto gerado por usuário.
function stripControlChars(text) {
  return text.replace(new RegExp('[\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u2064\\uFEFF]', 'g'), '');
}

module.exports = { stripControlChars };
