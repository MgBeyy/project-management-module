using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services;

public interface IReportService
{
    Task<ReportDto> GenerateReport(GenerateReportForm form, string webRootPath);
    Task<PagedResult<ReportDto>> Query(QueryReportForm form);
    Task<byte[]> ExportProjectTimeLatencyReport(QueryProjectForm filters);
    Task<ReportDto> ExportSaveTaskReport(QueryTaskForm filters, string webRootPath);
    Task DeleteReportAsync(int reportId, string webRootPath);
}