using System.Security.Principal;

namespace PMM.Core.Security
{
    // Interface'i de DTO'ya uygun olarak güncelleyelim.
    public interface IAppPrincipal : IPrincipal
    {
        int Id { get; set; }
        string Name { get; set; }
        string Email { get; set; }
        // IList<string> Roles { get; set; } // Gelecekte eklenebilir.
    }

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

        // Bu alanlar DTO'da olmadığı için kaldırıldı.
        // public string? Phone { get; set; } = string.Empty;
        // public string FirstName { get; set; } = string.Empty;
        // public string LastName { get; set; } = string.Empty;

        // Roller ve İzinler gelecekte eklenebilir.
        // public IList<string> Roles { get; set; }
        // public IList<EPermission> Permissions { get; set; }

        // public bool HasPermission(EPermission permission)
        // {
        //     return Permissions.Any(p => p == permission);
        // }
    }
}