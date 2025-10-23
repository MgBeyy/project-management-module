using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using PMM.Core.Exceptions;

namespace PMM.API.Filters
{
    public class ApiExceptionFilter : IExceptionFilter
    {
        private readonly IConfiguration _configuration;

        public ApiExceptionFilter(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void OnException(ExceptionContext context)
        {
            string message = GetBaseErrorMessage(context.Exception);

            bool showStackTrace = _configuration.GetValue<bool>("ApiSettings:ShowStackTrace", defaultValue: false);
            string? stackTrace = showStackTrace ? context.Exception.ToString() : null;

            if (context.Exception is NotFoundException)
            {
                context.Result = Response(message, "item not found", StatusCodes.Status404NotFound);
                return;
            }

            if (context.Exception is BusinessException businessException)
            {
                context.Result = Response(message, "One or more business validation errors occurred.", StatusCodes.Status400BadRequest);
                return;
            }

            if (context.Exception is DbUpdateException)
            {
                context.Result = Response(message, "Database update error", StatusCodes.Status400BadRequest, stackTrace);
                return;
            }

            if (context.Exception is ArgumentNullException)
            {
                context.Result = Response(message, "missing data", StatusCodes.Status400BadRequest);
                return;
            }

            if (context.Exception is UnauthorizedAccessException)
            {
                context.Result = Response(message, "Unauthorized", StatusCodes.Status403Forbidden);
                return;
            }

            context.Result = Response(message, "Internal Server Error", StatusCodes.Status500InternalServerError, stackTrace);
        }

        private string GetBaseErrorMessage(Exception ex)
        {
            if (ex.InnerException != null)
            {
                return GetBaseErrorMessage(ex.InnerException);
            }
            return ex.Message;
        }

        public ObjectResult Response(string message, string title, int status, string? stackTrace = null)
        {
            var result = new ApiResponse
            {
                StatusCode = status,
                Message = message,
                ResponseException = title,
                IsError = true,
                Version = "1.0",
                Result = stackTrace
            };

            return new ObjectResult(result)
            {
                StatusCode = status
            };
        }

        public ObjectResult Response(Dictionary<string, List<string>> errors, string title, int status)
        {
            var result = new ApiResponse
            {
                StatusCode = status,
                Message = title,
                ResponseException = title,
                IsError = true,
                Version = "1.0",
                Result = errors
            };

            return new ObjectResult(result)
            {
                StatusCode = status
            };
        }
    }
}