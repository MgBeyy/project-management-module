using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Attributes
{
    /// <summary>
    /// Nullable enum deðerlerinin geçerli olup olmadýðýný kontrol eden validation attribute'u.
    /// Null kabul eder, ancak 0 deðerini ve tanýmlanmamýþ enum deðerlerini reddeder.
    /// </summary>
    public class ValidNullableEnumAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            // Null ise geçerli (nullable enum için)
            if (value == null)
                return true;

            var enumType = value.GetType();
            
            // Enum deðilse geçersiz
            if (!enumType.IsEnum)
                return false;

            // Enum'un underlying type'ýný al (genellikle int)
            var underlyingValue = Convert.ToInt32(value);
            
            // 0 deðerini reddet (varsayýlan deðer)
            if (underlyingValue == 0)
                return false;

            // Enum'da tanýmlý bir deðer mi kontrol et
            return Enum.IsDefined(enumType, value);
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} alaný için geçerli bir deðer seçiniz.";
        }
    }
}