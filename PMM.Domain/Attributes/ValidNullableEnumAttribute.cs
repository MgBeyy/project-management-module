using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Attributes
{
    /// <summary>
    /// Nullable enum de�erlerinin ge�erli olup olmad���n� kontrol eden validation attribute'u.
    /// Null kabul eder, ancak 0 de�erini ve tan�mlanmam�� enum de�erlerini reddeder.
    /// </summary>
    public class ValidNullableEnumAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            // Null ise ge�erli (nullable enum i�in)
            if (value == null)
                return true;

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