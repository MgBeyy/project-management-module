using PMM.Core.Exceptions;

namespace PMM.Core.Common
{
    public static class NameValidator
    {
        public static void ValidateCode(string code)
        {
            if (string.IsNullOrEmpty(code)) return;
            string trimmed = code.Trim();
            if (trimmed.Contains(' ') || trimmed.Contains('/') || trimmed.Contains('\\') || ContainsTurkishChars(trimmed))
            {
                throw new BusinessException("Kod geçersiz karakter içeriyor. Boşluk, eğik çizgi veya Türkçe karakter bulunamaz.");
            }
        }

        public static void ValidateTitle(string title)
        {
            if (string.IsNullOrEmpty(title)) return;
            string trimmed = title.Trim();
        }

        private static bool ContainsTurkishChars(string input)
        {
            string turkishChars = "çğıöşüÇĞİÖŞÜ";
            return input.Any(c => turkishChars.Contains(c));
        }
    }
}