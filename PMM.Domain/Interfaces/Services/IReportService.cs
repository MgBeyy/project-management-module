using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services;

public interface IReportService
{
    Task<byte[]> ExportProjectsReport(QueryProjectForm filters);
}