// Letters that only appear in Vietnamese (lowercase; the check ignores case).
const VIETNAMESE = /[ăâđêôơưàáạảãầấậẩẫằắặẳẵèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

/**
 * The title font class for a piece of text. Cinzel Decorative has no Vietnamese
 * accents, so titles like "Tử Vi" or "Đại vận" use the matching Playfair small capitals.
 */
export function displayFont(text: string): 'font-display' | 'font-display-vn' {
  return VIETNAMESE.test(text) ? 'font-display-vn' : 'font-display';
}
