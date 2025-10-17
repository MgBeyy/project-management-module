using PMM.Domain.Security;
using System.Security.Principal;

namespace PMM.Core.Security
{
    public class AppPrincipal : IAppPrincipal
    {
        public IIdentity Identity { get; private set; }

        public AppPrincipal(string userName)
        {
            this.Identity = new GenericIdentity(userName);
        }

        public bool IsInRole(string role)
        {
            return true;
        }

        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}