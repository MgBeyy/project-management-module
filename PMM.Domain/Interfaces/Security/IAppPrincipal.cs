using System.Security.Principal;

namespace PMM.Domain.Security
{
    public interface IAppPrincipal : IPrincipal
    {
        int Id { get; set; }
        string Name { get; set; }
        string Email { get; set; }
    }
}