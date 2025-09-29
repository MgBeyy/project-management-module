using Autofac;

namespace PMM.API.Autofac
{
    public class ControllersModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterAssemblyTypes(typeof(ControllersModule).Assembly)
            .Where(t => t.Name.EndsWith("Controller"))
            .PropertiesAutowired();
        }
    }
}
