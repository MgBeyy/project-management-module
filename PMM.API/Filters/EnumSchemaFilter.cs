using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PMM.API.Filters
{
    public class EnumSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            var type = context.Type;

            var enumType = Nullable.GetUnderlyingType(type) ?? type;

            if (enumType.IsEnum)
            {
                var enumNames = Enum.GetNames(enumType);
                schema.Description += $" Possible values: {string.Join(" | ", enumNames)}.";

                var defaultValue = Activator.CreateInstance(enumType);
                if (defaultValue != null)
                {
                    schema.Default = new Microsoft.OpenApi.Any.OpenApiString(defaultValue.ToString());
                }

                schema.Example = new Microsoft.OpenApi.Any.OpenApiString(string.Join(" | ", enumNames));
            }
        }
    }
}
