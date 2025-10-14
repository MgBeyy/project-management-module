using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Globalization;

namespace PMM.API.ModelBinders
{
    public class DateOnlyModelBinder : IModelBinder
    {
        private readonly string[] _formats = new[]
        {
            "dd-MM-yyyy",
            "dd/MM/yyyy",
            "yyyy-MM-dd",
            "yyyy/MM/dd",
            "dd-M-yyyy",
            "d-M-yyyy",
            "d-MM-yyyy"
        };

        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
                throw new ArgumentNullException(nameof(bindingContext));

            var modelName = bindingContext.ModelName;
            var valueProviderResult = bindingContext.ValueProvider.GetValue(modelName);

            if (valueProviderResult == ValueProviderResult.None)
            {
                return Task.CompletedTask;
            }

            bindingContext.ModelState.SetModelValue(modelName, valueProviderResult);

            var value = valueProviderResult.FirstValue;

            if (string.IsNullOrEmpty(value))
            {
                // Nullable DateOnly? i�in null d�nebiliriz
                if (Nullable.GetUnderlyingType(bindingContext.ModelType) != null)
                {
                    bindingContext.Result = ModelBindingResult.Success(null);
                }
                return Task.CompletedTask;
            }

            foreach (var format in _formats)
            {
                if (DateOnly.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    bindingContext.Result = ModelBindingResult.Success(date);
                    return Task.CompletedTask;
                }
            }

            // E�er hi�bir format �al��mazsa, hata mesaj� ver
            bindingContext.ModelState.TryAddModelError(
                modelName,
                $"The value '{value}' is not valid. Expected formats: {string.Join(", ", _formats)}");

            return Task.CompletedTask;
        }
    }
}
