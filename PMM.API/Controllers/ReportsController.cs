using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;
using PMM.Domain.Enums;

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

    [HttpPost("generate")]
    public async Task<ApiResponse> GenerateReport([FromBody] GenerateReportForm form)
    {
        var report = await _reportService.GenerateReport(form, _env.WebRootPath);
        return new ApiResponse(report, StatusCodes.Status200OK);
    }

    [HttpGet]
    public async Task<ApiResponse> Query([FromQuery] QueryReportForm? form)
    {
        form ??= new QueryReportForm();
        var reports = await _reportService.Query(form);
        return new ApiResponse(reports, StatusCodes.Status200OK);
    }

    [HttpPost("task-report")]
    public async Task<ApiResponse> ExportTaskReport([FromBody] QueryTaskForm filters)
    {
        var report = await _reportService.ExportSaveTaskReport(filters, _env.WebRootPath);
        return new ApiResponse(report, StatusCodes.Status200OK);
    }

    [HttpGet("project-time-latency-direct")]
    public async Task<IActionResult> ExportProjectTimeLatencyDirect([FromQuery] QueryProjectForm filters)
    {
        var fileContents = await _reportService.ExportProjectTimeLatencyReport(filters);
        return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "ProjeZamanGecikmeRaporu.xlsx");
    }
}