// Utility to patch markdown-it missing functions
// This fixes the "isSpace is not defined" error in markmap-lib

// Unicode categories for space characters (matching markdown-it's isSpace function)
const isSpace = (code: number): boolean => {
  switch (code) {
    case 0x09: // tab
    case 0x0A: // line feed
    case 0x0B: // vertical tab
    case 0x0C: // form feed
    case 0x0D: // carriage return
    case 0x20: // space
    case 0xA0: // no-break space
    case 0x1680: // ogham space mark
    case 0x202F: // narrow no-break space
    case 0x205F: // medium mathematical space
    case 0x3000: // ideographic space
      return true;
    default:
      if (code >= 0x2000 && code <= 0x200A) { // en quad, em quad, en space, em space, three-per-em space, four-per-em space, six-per-em space, figure space, punctuation space, thin space, hair space
        return true;
      }
      return false;
  }
};

// Check if a character is a markdown punctuation character
const isPunctChar = (code: number): boolean => {
  return (code >= 0x21 && code <= 0x2F) ||
         (code >= 0x3A && code <= 0x40) ||
         (code >= 0x5B && code <= 0x60) ||
         (code >= 0x7B && code <= 0x7E);
};

// Check if a character is a markdown whitespace or punctuation
const isMdAsciiPunct = (code: number): boolean => {
  return isPunctChar(code);
};

// Patch function to add missing utilities to markdown-it
const patchMarkdownItUtils = () => {
  try {
    if (typeof window !== 'undefined') {
      // For browser environment, patch the global markdown-it if available
      const globalWindow = window as unknown as Record<string, unknown>;
      const MarkdownIt = globalWindow.markdownit || globalWindow.MarkdownIt;
      if (MarkdownIt && typeof MarkdownIt === 'object' && (MarkdownIt as { utils?: Record<string, unknown> }).utils) {
        const utils = (MarkdownIt as { utils: Record<string, unknown> }).utils;
        if (!utils.isSpace) {
          utils.isSpace = isSpace;
        }
        if (!utils.isPunctChar) {
          utils.isPunctChar = isPunctChar;
        }
        if (!utils.isMdAsciiPunct) {
          utils.isMdAsciiPunct = isMdAsciiPunct;
        }
      }

      // Also try to patch via dynamic import if available
      try {
        import('markdown-it').then((mdIt) => {
          if (mdIt && mdIt.default && (mdIt.default as { utils?: unknown }).utils) {
            const utils = (mdIt.default as unknown as { utils: Record<string, unknown> }).utils;
            if (!utils.isSpace) utils.isSpace = isSpace;
            if (!utils.isPunctChar) utils.isPunctChar = isPunctChar;
            if (!utils.isMdAsciiPunct) utils.isMdAsciiPunct = isMdAsciiPunct;
          }
        }).catch(() => {
          // Ignore import errors
        });
      } catch {
        // Ignore import errors
      }

      // Add utilities to global scope as fallback
      if (!globalWindow.isSpace) {
        globalWindow.isSpace = isSpace;
      }
      if (!globalWindow.isPunctChar) {
        globalWindow.isPunctChar = isPunctChar;
      }
      if (!globalWindow.isMdAsciiPunct) {
        globalWindow.isMdAsciiPunct = isMdAsciiPunct;
      }
    }
  } catch (error) {
    console.warn('Could not patch markdown-it utils:', error);
  }
};

// Apply the patch immediately
patchMarkdownItUtils();

export { isSpace, isPunctChar, isMdAsciiPunct, patchMarkdownItUtils };
