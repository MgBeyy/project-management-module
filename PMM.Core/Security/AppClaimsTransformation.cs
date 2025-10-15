using PMM.Core.DTOs;
using System.Security.Claims;

namespace PMM.Core.Security
{
    public class AppClaimsTransformation
    {
        public static AppPrincipal Transform(UserDto user)
        {
            AppPrincipal newUser = new AppPrincipal(user.Email);
            newUser.Id = user.Id;
            newUser.Name = user.Name;
            newUser.Email = user.Email;

            return newUser;
        }

        public static AppPrincipal Transform(ClaimsPrincipal principal)
        {
            var email = GetClaim(principal, ClaimTypes.NameIdentifier);

            AppPrincipal newUser = new AppPrincipal(email);
            newUser.Id = GetClaimInt(principal, ClaimTypes.Sid);
            newUser.Email = email;
            newUser.Name = GetClaim(principal, ClaimTypes.Name);

            return newUser;
        }

        public static Claim[] GetClaims(UserDto user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Email),
                new Claim(ClaimTypes.Sid, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),

            };

            // Roller gelecekte gerekirse bu döngü aktif edilebilir.
            // foreach (var role in user.Roles)
            // {
            //     claims.Add(new Claim(ClaimTypes.Role, role));
            // }

            // İzinler gelecekte gerekirse bu döngü aktif edilebilir.
            // foreach (var permission in user.Permissions)
            // {
            //     claims.Add(new Claim("Permission", permission.ToString()));
            // }

            return claims.ToArray();
        }

        // Bu metotlar gelecekte roller veya izinler eklenirse kullanılabilir.
        // private static IList<string> GetClaimRoles(ClaimsPrincipal principal)
        // {
        //     return principal.Claims.Where(o => o.Type == ClaimTypes.Role)
        //                     .Select(x => x.Value)
        //                     .ToList();
        // }

        // private static IList<EPermission> GetClaimPermissions(ClaimsPrincipal principal)
        // {
        //     return principal.Claims.Where(o => o.Type == "Permission")
        //           .Select(x => (EPermission)Enum.Parse(typeof(EPermission), x.Value))
        //           .ToList();
        // }

        private static string GetClaim(ClaimsPrincipal principal, string type)
        {
            return principal.Claims.FirstOrDefault(o => o.Type == type)?.Value;
        }

        private static int GetClaimInt(ClaimsPrincipal principal, string type)
        {
            var claim = GetClaim(principal, type);
            if (string.IsNullOrEmpty(claim))
                return 0;
            return Convert.ToInt32(claim);
        }
    }
}