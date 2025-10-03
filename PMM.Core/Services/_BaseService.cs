using Employee.Portal.Core.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using PMM.Data.Repositories;
using System.Security.Principal;
namespace PMM.Core.Services
{
    public abstract class _BaseService
    {
        protected readonly IPrincipal _principal;

        protected readonly ILogger _logger;

        protected readonly IUserRepository _userRepository;

        public _BaseService(IPrincipal principal, ILogger logger, IUserRepository userRepository)
        {
            _logger = logger;
            _principal = principal;
            _userRepository = userRepository;
        }

        private AppPrincipal _user;
        protected AppPrincipal LoggedInUser
        {
            get
            {
                if (_user != null)
                    return _user;

                var user = _userRepository.QueryAll().FirstOrDefault();
                if (user != null)
                {
                    _user = new AppPrincipal(user.Name) { Id = user.Id, Email = user.Email, Name = user.Name };
                    return _user;
                }
                throw new UnauthorizedAccessException("Veritabanında hiç kullanıcı yok. Lütfen bir kullanıcı ekleyin.");
            }
        }
        public ISheet getExcelSheet(IFormFile file)

        {

            using var stream = file.OpenReadStream();
            IWorkbook workbook = Path.GetExtension(file.FileName).ToLower() switch
            {
                ".xls" => new HSSFWorkbook(stream),
                ".xlsx" => new XSSFWorkbook(stream),
                _ => throw new NotSupportedException("Only .xls and .xlsx are supported.")
            };

            return workbook.GetSheetAt(0);
        }


    }
}