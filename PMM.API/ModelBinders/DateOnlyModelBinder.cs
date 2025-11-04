using Microsoft.AspNetCore.Mvc.ModelBinding;
using PMM.Core.Helpers;

namespace PMM.API.ModelBinders
{
    public class DateOnlyModelBinder : IModelBinder
    {
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
                if (Nullable.GetUnderlyingType(bindingContext.ModelType) != null)
                {
                    bindingContext.Result = ModelBindingResult.Success(null);
                }
                return Task.CompletedTask;
            }

            if (long.TryParse(value, out var timestamp))
            {
                try
                {
                    var dateOnly = DateTimeHelper.FromUnixMillisecondsToDateOnly(timestamp);
                    bindingContext.Result = ModelBindingResult.Success(dateOnly);
                    return Task.CompletedTask;
                }
                catch (Exception ex)
                {
                    bindingContext.ModelState.TryAddModelError(
                        modelName,
                        $"Invalid timestamp value '{value}': {ex.Message}");
                    return Task.CompletedTask;
                }
            }

            // Sadece millisecond timestamp kabul ediyoruz
            bindingContext.ModelState.TryAddModelError(
                modelName,
                $"The value '{value}' is not valid. Expected Unix timestamp in milliseconds");

            return Task.CompletedTask;
        }
    }
}
