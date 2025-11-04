using Autofac;
using PMM.Core.Helpers;

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
        }
    }
}
