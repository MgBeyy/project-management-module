using System.ComponentModel.DataAnnotations;

namespace PMM.Domain.Attributes
{
    /// <summary>
    /// Enum deðerlerinin geçerli olup olmadýðýný kontrol eden validation attribute'u.
    /// 0 deðerini ve tanýmlanmamýþ enum deðerlerini reddeder.
    /// </summary>
    public class ValidEnumAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true; // Nullable enum'lar için null kabul edilir

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