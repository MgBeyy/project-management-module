using System.ComponentModel.DataAnnotations;
using System.Text; // StringBuilder için bu using ifadesi eklenmeli

namespace PMM.Core.Validators
{
    public class FormValidatorResults
    {
        public bool IsValid { get; set; }

        /// <summary>
        /// Tüm doğrulama hatalarını içeren, kullanıcı tarafından okunabilir tek bir metin.
        /// Doğrulama başarılıysa bu alan boş olacaktır.
        /// </summary>
        public string ErrorMessage { get; set; }

        public FormValidatorResults(bool isValid, List<ValidationResult> results)
        {
            IsValid = isValid;
            ErrorMessage = string.Empty; // Başlangıçta boş olarak ayarlıyoruz

            // Eğer doğrulama başarısızsa ve hata listesi mevcutsa
            if (!isValid && results != null && results.Count > 0)
            {
                // Çok sayıda metin birleştirme işlemi için StringBuilder kullanmak daha performanslıdır.
                var errorBuilder = new StringBuilder();

                foreach (var item in results)
                {
                    // Her bir hata mesajını sonuna yeni bir satır ekleyerek ekliyoruz.
                    errorBuilder.AppendLine(item.ErrorMessage);
                }

                // Oluşturulan metni ErrorMessage özelliğine atıyoruz.
                // Trim() metodu, metnin başındaki ve sonundaki olası boşlukları temizler.
                ErrorMessage = errorBuilder.ToString().Trim();
            }
        }
    }
}