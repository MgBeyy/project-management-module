using PMM.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


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

//CORS
app.UseCors(WebApplicationBuilderExtension.MyAllowSpecificOrigins);

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
