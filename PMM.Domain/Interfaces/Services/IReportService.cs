using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services;

public interface IReportService
{
    Task<ReportDto> ExportSaveProjectTimeLatencyReport(QueryProjectForm filters, string webRootPath);
    Task<byte[]> ExportProjectTimeLatencyReport(QueryProjectForm filters);
    Task<PagedResult<ReportDto>> Query(QueryReportForm form);
}