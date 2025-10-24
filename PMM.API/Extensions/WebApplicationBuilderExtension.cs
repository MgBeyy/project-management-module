using Autofac;
using Autofac.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using PMM.API.Autofac;
using PMM.Core.Autofac;
using PMM.Core.Security;
using PMM.Data.Autofac;
using PMM.Data.Contexts;
using PMM.Domain.Security;
using Serilog;
using Serilog.Events;
using System.Security.Principal;

namespace PMM.API.Extensions
{
    public static class WebApplicationBuilderExtension
    {
        public const string MyAllowSpecificOrigins = "_pmmApiCorsPolicy";

        /// Configures Serilog logging for the application.
        public static WebApplicationBuilder ConfigureLogging(this WebApplicationBuilder builder)
        {
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

        /// Adds essential ASP.NET Core framework services like HttpClient, HttpContextAccessor, CORS.
        public static WebApplicationBuilder AddEssentialServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            builder.Services.AddScoped<IAppPrincipal, AppPrincipal>();
            builder.Services.AddTransient<IPrincipal>(sp => sp.GetRequiredService<IHttpContextAccessor>().HttpContext?.User ?? WindowsPrincipal.Current);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://pmm.engzaid.tech", "http://52.90.58.103:3000")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    });
            });

            return builder;
        }

        /// Configures Autofac as the service provider and registers DbContext and custom modules.
        public static WebApplicationBuilder ConfigureAutofacAndData(this WebApplicationBuilder builder)
        {
            builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());

            builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
            {
                containerBuilder.Register(c =>
                {
                    var principal = c.Resolve<IAppPrincipal>();

                    var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                        .UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
                        .Options;

                    return new ApplicationDbContext(options, principal);
                })
                .AsSelf()
                .InstancePerLifetimeScope();

                containerBuilder.RegisterModule(new ControllersModule());
                containerBuilder.RegisterModule(new RepositoriesModule());
                containerBuilder.RegisterModule(new ServicesModule());
            });

            return builder;
        }
    }
}