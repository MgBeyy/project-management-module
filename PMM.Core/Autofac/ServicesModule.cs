using Autofac;
using PMM.Core.Helpers;
using PMM.Core.Services.ReportHandlers;

namespace PMM.Core.Autofac
{
    public class ServicesModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterAssemblyTypes(typeof(ServicesModule).Assembly)
            .Where(t => t.Name.EndsWith("Service"))
            .AsImplementedInterfaces()
            .PropertiesAutowired();

            builder.RegisterType<NpoiExcelHelper>().AsSelf().InstancePerDependency();

            // Register report handlers
            builder.RegisterType<ProjectTimeLatencyReportHandler>().As<IReportHandler>();
            builder.RegisterType<TaskReportHandler>().As<IReportHandler>();
            builder.RegisterType<EffortAndCapacityReportHandler>().As<IReportHandler>();
            builder.RegisterType<TeamPerformanceReportHandler>().As<IReportHandler>();
        }
    }
}
