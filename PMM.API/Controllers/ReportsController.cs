using Microsoft.AspNetCore.Mvc;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers;

public class ReportsController : _BaseController
{
    private readonly IReportService _reportService;

    public ReportsController(ILogger<ReportsController> logger, IReportService reportService) : base(logger)
    {
        _reportService = reportService;
    }

    [HttpGet("export/projects")]
    public async Task<IActionResult> ExportProjects([FromQuery] QueryProjectForm filters)
    {
        var fileContents = await _reportService.ExportProjectsReport(filters);
        var fileName = $"Projects_{DateTime.Now:yyyyMMdd}.xlsx";
        return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }
}