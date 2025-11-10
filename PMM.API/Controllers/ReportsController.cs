using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
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

    [HttpPost("create/projects")]
    public async Task<ApiResponse> CreateProjects([FromQuery] QueryProjectForm filters)
    {
        var report = await _reportService.ExportProjectsReport(filters, _env.WebRootPath);
        return new ApiResponse(report, StatusCodes.Status201Created);
    }

    [HttpGet]
    public async Task<ApiResponse> Query([FromQuery] QueryReportForm? form)
    {
        form ??= new QueryReportForm();
        var reports = await _reportService.Query(form);
        return new ApiResponse(reports, StatusCodes.Status200OK);
    }
}