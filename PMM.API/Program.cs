using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using PMM.API.Extensions;
using PMM.API.Filters;
using PMM.Data.Contexts;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    // Enum’larýn hem sayý hem isimlerini göstermesi için:
    c.SchemaFilter<EnumSchemaFilter>();
    c.UseInlineDefinitionsForEnums();
});
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Enum'larý string olarak serialize et
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


// Custom application setup using chained extension methods
builder
    .ConfigureLogging()          // Serilog configuration
    .AddEssentialServices()      // Core framework services (HttpClient, CORS, HttpContextAccessor)
    .ConfigureAutofacAndData();  // Autofac setup and DbContext registration

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        // Veritabaný hazýr deðilse/migration varsa uygula
        // Bu, senkron bir iþlemdir ve uygulamanýn baþlamasýný bekletir.
        context.Database.Migrate();

        // Ýsteðe baðlý: Seed Data (baþlangýç verisi) ekleme
        // DbSeeder.SeedAsync(context).Wait();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
        // Gerçek bir uygulamada hata fýrlatmak yerine loglamak daha iyi olabilir
    }
}


//CORS
app.UseCors(WebApplicationBuilderExtension.MyAllowSpecificOrigins);

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
