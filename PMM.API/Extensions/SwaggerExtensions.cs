using Microsoft.OpenApi.Models;
using PMM.API.Filters;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PMM.API.Extensions
{
    public static class SwaggerExtensions
    {
        public static void CustomizeSwaggerGen(this SwaggerGenOptions c)
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Proje Yönetimi Modülü API",
                Version = "v0.1 alpa",
                Description = "Kurumsal Proje Yönetimi Servisleri",
                Contact = new OpenApiContact
                {
                    Name = "MgBeyy",
                    Email = "zaidalmoughrabi@gmail.com",
                    Url = new Uri("https://github.com/mgbeyy")
                },
                License = new OpenApiLicense
                {
                    Name = "Proprietary/Closed Source",
                    Url = new Uri("https://choosealicense.com/no-permission/")
                }
            });
            c.UseInlineDefinitionsForEnums();
            c.SchemaFilter<EnumSchemaFilter>();
        }
    }
}
