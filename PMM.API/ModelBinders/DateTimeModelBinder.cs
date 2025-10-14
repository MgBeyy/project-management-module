using Microsoft.AspNetCore.Mvc.ModelBinding;
using PMM.Core.Helpers;

namespace PMM.API.ModelBinders
{
    public class DateTimeModelBinder : IModelBinder
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
                // Nullable DateTime? için null dönebiliriz
                if (Nullable.GetUnderlyingType(bindingContext.ModelType) != null)
                {
                    bindingContext.Result = ModelBindingResult.Success(null);
                }
                return Task.CompletedTask;
            }

            // Sadece Unix timestamp (milliseconds) formatýný kabul et
            if (long.TryParse(value, out var timestamp))
            {
                try
                {
                    var dateTime = DateTimeHelper.FromUnixMillisecondsToDateTime(timestamp);
                    bindingContext.Result = ModelBindingResult.Success(dateTime);
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