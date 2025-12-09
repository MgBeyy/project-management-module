using PMM.Domain.DTOs;
using PMM.Domain.Enums;
using System.Text.Json;

namespace PMM.Core.Services.ReportHandlers
{
    public interface IReportHandler
    {
        EReportType Type { get; }
        Task<ReportDto> HandleAsync(JsonElement filters, string? name, string webRootPath);
    }
}