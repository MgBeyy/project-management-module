using Microsoft.AspNetCore.Mvc;
using PMM.API.Filters;

namespace PMM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [TypeFilter(typeof(ApiExceptionFilter))]
    public abstract class _BaseController : ControllerBase
    {
        protected readonly ILogger _logger;

        public _BaseController(ILogger logger)
        {
            _logger = logger;
        }
    }
}