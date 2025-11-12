using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers;

public class ReportsController : _BaseController
{
    private readonly IReportService _reportService;
    private readonly IWebHostEnvironment _env;

    public ReportsController(ILogger<ReportsController> logger, IReportService reportService, IWebHostEnvironment env) : base(logger)
    {
        _reportService = reportService;
        _env = env;
    }

    [HttpGet("project-time-latency")]
    public async Task<ApiResponse> ExportProjectTimeLatency([FromQuery] QueryProjectForm filters)
    {
        var report = await _reportService.ExportSaveProjectTimeLatencyReport(filters, _env.WebRootPath);
        return new ApiResponse(report, StatusCodes.Status200OK);
    }

    [HttpGet]
    public async Task<ApiResponse> Query([FromQuery] QueryReportForm? form)
    {
        form ??= new QueryReportForm();
        var reports = await _reportService.Query(form);
        return new ApiResponse(reports, StatusCodes.Status200OK);
    }

    [HttpGet("project-time-latency-direct")]
    public async Task<IActionResult> ExportProjectTimeLatencyDirect([FromQuery] QueryProjectForm filters)
    {
        var fileContents = await _reportService.ExportProjectTimeLatencyReport(filters);
        return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ProjeZamanGecikmeRaporu.xlsx");
    }
}