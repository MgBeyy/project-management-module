using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services;

public interface IReportService
{
    Task<ReportDto> ExportProjectsReport(QueryProjectForm filters, string webRootPath);
    Task<PagedResult<ReportDto>> Query(QueryReportForm form);
}