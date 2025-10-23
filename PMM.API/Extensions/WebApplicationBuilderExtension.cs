using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using PMM.API.Autofac;
using PMM.Core.Autofac;
using PMM.Data.Autofac;
using PMM.Data.Contexts;
using Serilog;
using Serilog.Events;
using System.Security.Principal;

namespace PMM.API.Extensions
{
    public static class WebApplicationBuilderExtension
    {
        // Public constant for CORS policy name, allowing reuse in Program.cs
        public const string MyAllowSpecificOrigins = "_pmmApiCorsPolicy";

        /// <summary>
        /// Configures Serilog logging for the application.
        /// </summary>
        public static WebApplicationBuilder ConfigureLogging(this WebApplicationBuilder builder)
        {
            // ===== Serilog Configuration =====
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Debug)
                .Enrich.FromLogContext()
                .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                .WriteTo.File("Logs/log-.txt",
                    rollingInterval: RollingInterval.Day,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
                .WriteTo.File("Logs/error-.txt",
                    rollingInterval: RollingInterval.Day,
                    restrictedToMinimumLevel: LogEventLevel.Error,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
                .CreateLogger();

            builder.Host.UseSerilog();
            return builder;
        }

        /// <summary>
        /// Adds essential ASP.NET Core framework services like HttpClient, HttpContextAccessor, CORS.
        /// </summary>
        public static WebApplicationBuilder AddEssentialServices(this WebApplicationBuilder builder)
        {
            // ===== ASP.NET Core Services =====
            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            // Register IPrincipal to get the current user (requires IHttpContextAccessor)
            builder.Services.AddTransient<IPrincipal>(sp => sp.GetRequiredService<IHttpContextAccessor>().HttpContext?.User ?? WindowsPrincipal.Current);

            // ===== CORS Configuration (Mandatory for API/Frontend communication) =====
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:5173","http://localhost:3000","https://pmm.engzaid.tech/","http://52.90.58.103:3000")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });

            return builder;
        }

        /// <summary>
        /// Configures Autofac as the service provider and registers DbContext and custom modules.
        /// </summary>
        public static WebApplicationBuilder ConfigureAutofacAndData(this WebApplicationBuilder builder)
        {
            // ===== Autofac Integration =====
            builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

            builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
            {
                // ----- DbContext Registration (Npgsql) -----
                containerBuilder.Register(c =>
                {
                    var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                        .UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
                        .Options;
                    return new ApplicationDbContext(options);
                })
                .AsSelf()
                .InstancePerLifetimeScope(); // Scoped lifetime

                // ----- Autofac Modules Registration -----
                containerBuilder.RegisterModule(new ControllersModule());
                containerBuilder.RegisterModule(new RepositoriesModule());
                containerBuilder.RegisterModule(new ServicesModule());
            });

            return builder;
        }
    }
}
