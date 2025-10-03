using Employee.Portal.Core.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.Security.Claims;
using System.Security.Principal;
namespace PMM.Core.Services
{
    public abstract class _BaseService
    {
        protected readonly IPrincipal _principal;

        protected readonly ILogger _logger;

        public _BaseService(IPrincipal principal, ILogger logger)
        {
            _logger = logger;
            _principal = principal;
        }

        private AppPrincipal _user;
        protected AppPrincipal LoggedInUser
        {
            get
            {
                if (_user != null)
                    return _user;

                var principal = _principal as ClaimsPrincipal;
                if (principal == null)
                    throw new UnauthorizedAccessException("Unable to find logged in person information");

                _user = AppClaimsTransformation.Transform(principal);
                return _user;
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