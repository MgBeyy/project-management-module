using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;

namespace PMM.API.ModelBinders
{
    public class DateOnlyModelBinderProvider : IModelBinderProvider
    {
        public IModelBinder? GetBinder(ModelBinderProviderContext context)
        {
            if (context == null)
                throw new ArgumentNullException(nameof(context));

            if (context.Metadata.ModelType == typeof(DateOnly) || 
                context.Metadata.ModelType == typeof(DateOnly?))
            {
                return new BinderTypeModelBinder(typeof(DateOnlyModelBinder));
            }

            return null;
        }
    }
}
