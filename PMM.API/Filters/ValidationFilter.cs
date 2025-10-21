using Microsoft.AspNetCore.Mvc.Filters;
using PMM.Core.Exceptions;

namespace PMM.API.Filters
{
    public class ValidationFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            // Eğer model durumu (ModelState) geçerli değilse...
            if (!context.ModelState.IsValid)
            {
                // Tüm hata mesajlarını ModelState'ten çekip bir liste yapıyoruz.
                var errorMessages = context.ModelState.Values
                                           .SelectMany(v => v.Errors)
                                           .Select(e => e.ErrorMessage)
                                           .ToList();

                // Hata mesajlarını tek bir string'de birleştiriyoruz (aralarına yeni satır koyarak).
                var combinedErrorMessage = string.Join("\n", errorMessages);

                // Kendi özel BusinessException'ımızı fırlatıyoruz.
                // Bu exception, daha önce gösterdiğin ApiExceptionFilter tarafından yakalanacak.
                throw new BusinessException(combinedErrorMessage);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            // Bu metodu boş bırakabiliriz, çünkü işlem bittikten sonra bir şey yapmamıza gerek yok.
        }
    }
}
