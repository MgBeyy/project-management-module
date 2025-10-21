using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Attributes
{
    /// <summary>
    /// Enum de�erlerinin ge�erli olup olmad���n� kontrol eden validation attribute'u.
    /// 0 de�erini ve tan�mlanmam�� enum de�erlerini reddeder.
    /// </summary>
    public class ValidEnumAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true; // Nullable enum'lar i�in null kabul edilir

            var enumType = value.GetType();
            
            // Enum de�ilse ge�ersiz
            if (!enumType.IsEnum)
                return false;

            // Enum'un underlying type'�n� al (genellikle int)
            var underlyingValue = Convert.ToInt32(value);
            
            // 0 de�erini reddet (varsay�lan de�er)
            if (underlyingValue == 0)
                return false;

            // Enum'da tan�ml� bir de�er mi kontrol et
            return Enum.IsDefined(enumType, value);
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} alan� i�in ge�erli bir de�er se�iniz.";
        }
    }
}