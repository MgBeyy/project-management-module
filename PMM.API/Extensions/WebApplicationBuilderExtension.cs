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
                .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .WriteTo.Console()
                .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
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
                        policy.WithOrigins("http://localhost:5173")
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
