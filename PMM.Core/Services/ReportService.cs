using Microsoft.EntityFrameworkCore;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Helpers;
using PMM.Core.Mappers;
using PMM.Core.Services.ReportHandlers;
using PMM.Domain.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Text.Json;

namespace PMM.Core.Services;

public class ReportService : IReportService
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;
    private readonly NpoiExcelHelper _excelHelper;
    private readonly IReportRepository _reportRepository;
    private readonly IEnumerable<IReportHandler> _reportHandlers;

    public ReportService(IProjectService projectService, ITaskService taskService, NpoiExcelHelper excelHelper, IReportRepository reportRepository, IEnumerable<IReportHandler> reportHandlers)
    {
        _projectService = projectService;
        _taskService = taskService;
        _excelHelper = excelHelper;
        _reportRepository = reportRepository;
        _reportHandlers = reportHandlers;
    }

    public async Task<PagedResult<ReportDto>> Query(QueryReportForm form)
    {
        var query = _reportRepository.Query(x => true);

        if (!string.IsNullOrEmpty(form.Search))
        {
            query = query.Where(r =>
                r.Name.ToLower().Contains(form.Search.Trim().ToLower()));
        }

        if (form.Id.HasValue)
            query = query.Where(e => e.Id == form.Id.Value);

        if (!string.IsNullOrWhiteSpace(form.Name))
            query = query.Where(e => e.Name.ToLower().Contains(form.Name.Trim().ToLower()));

        if (form.Type.HasValue)
            query = query.Where(e => e.Type == form.Type.Value);

        if (form.CreatedById.HasValue)
            query = query.Where(e => e.CreatedById == form.CreatedById.Value);

        if (form.CreatedAt.HasValue)
            query = query.Where(e => e.CreatedAt == form.CreatedAt);
        if (form.CreatedAtMin.HasValue)
            query = query.Where(e => e.CreatedAt >= form.CreatedAtMin);
        if (form.CreatedAtMax.HasValue)
            query = query.Where(e => e.CreatedAt <= form.CreatedAtMax);

        if (form.UpdatedById.HasValue)
            query = query.Where(e => e.UpdatedById == form.UpdatedById.Value);

        if (form.UpdatedAt.HasValue)
            query = query.Where(e => e.UpdatedAt == form.UpdatedAt);
        if (form.UpdatedAtMin.HasValue)
            query = query.Where(e => e.UpdatedAt >= form.UpdatedAtMin);
        if (form.UpdatedAtMax.HasValue)
            query = query.Where(e => e.UpdatedAt <= form.UpdatedAtMax);

        query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

        int page = form.Page ?? 1;
        int pageSize = form.PageSize ?? 10;

        int totalRecords = await query.CountAsync();

        var reports = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<ReportDto>
        {
            Data = ReportMapper.Map(reports),
            TotalRecords = totalRecords,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ReportDto> GenerateReport(GenerateReportForm form, string webRootPath)
    {
        var handler = _reportHandlers.FirstOrDefault(h => h.Type == form.Type);
        if (handler == null)
        {
            throw new BusinessException("Unsupported report type");
        }

        var filters = form.Filters ?? JsonDocument.Parse("{}").RootElement;
        return await handler.HandleAsync(filters, form.Name, webRootPath);
    }

    public async Task<byte[]> ExportProjectTimeLatencyReport(QueryProjectForm filters)
    {
        filters.PageSize = 10000;
        filters.Page = 1;

        var projectsResult = await _projectService.Query(filters);
        var projects = projectsResult.Data;

        var detailedProjects = new List<DetailedProjectDto>();
        foreach (var project in projects)
        {
            var detailed = await _projectService.GetDetailedProjectAsync(project.Id);
            detailedProjects.Add(detailed);
        }

        var headers = new List<string>
        {
            "Proje adı",
            "Proje Kodu",
            "Proje Sorumluları",
            "Planlanan Başlangıç",
            "Gerçekleşen Başlangıç",
            "Başlangıç Durumu",
            "Planlanan Bitiş",
            "Gerçekleşen Bitiş",
            "Bitiş Durumu",
            "Planan Çalışma Günü",
            "Gerçekleşen Çalışma Günü",
            "Başlangıç Tarihi Sapması",
            "Bitiş Tarihi Sapması",
            "Sapma(Gün)",
            "Sapma Yüzdesi",
            "Durum",
            "Etiketler",
            "Alt Projeler"
        };

        var dataRows = new List<List<object>>();

        foreach (var project in detailedProjects)
        {
            var startDeviation = project.StartedAt.HasValue && project.PlannedStartDate.HasValue
                ? (project.StartedAt.Value.ToDateTime(TimeOnly.MinValue) - project.PlannedStartDate.Value.ToDateTime(TimeOnly.MinValue)).Days
                : (int?)null;

            var endDeviation = project.EndAt.HasValue && project.PlannedDeadline.HasValue
                ? (project.EndAt.Value.ToDateTime(TimeOnly.MinValue) - project.PlannedDeadline.Value.ToDateTime(TimeOnly.MinValue)).Days
                : (int?)null;

            var hoursDeviation = project.ActualHours.HasValue && project.PlannedHours.HasValue
                ? project.ActualHours.Value - project.PlannedHours.Value
                : (decimal?)null;

            var deviationPercentage = project.ActualHours.HasValue && project.PlannedHours.HasValue && project.PlannedHours.Value > 0
                ? ((project.ActualHours.Value - project.PlannedHours.Value) / project.PlannedHours.Value) * 100
                : (decimal?)null;

            var plannedDays = project.PlannedHours.HasValue ? decimal.Round(project.PlannedHours.Value / 8, 2) : (decimal?)null;
            var actualDays = project.ActualHours.HasValue ? decimal.Round(project.ActualHours.Value / 8, 2) : (decimal?)null;
            var deviationDays = hoursDeviation.HasValue ? decimal.Round(hoursDeviation.Value / 8, 2) : (decimal?)null;

            var startStatus = startDeviation.HasValue
                ? (startDeviation.Value == 0 ? "Zamanında" : startDeviation.Value > 0 ? "Geç" : "Erken")
                : "";

            var endStatus = endDeviation.HasValue
                ? (endDeviation.Value == 0 ? "Zamanında" : endDeviation.Value > 0 ? "Geç" : "Erken")
                : "";

            const string red = "#FF0000";
            const string green = "#00FF00";
            const string onTimeColor = "#000000";

            var startStatusRtc = new NpoiExcelHelper.RichTextCell();
            startStatusRtc.Text = startStatus;
            if (!string.IsNullOrEmpty(startStatus))
            {
                string color = startStatus == "Geç" ? red : startStatus == "Erken" ? green : onTimeColor;
                startStatusRtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = 0, End = startStatus.Length, ColorHex = color });
            }

            var endStatusRtc = new NpoiExcelHelper.RichTextCell();
            endStatusRtc.Text = endStatus;
            if (!string.IsNullOrEmpty(endStatus))
            {
                string color = endStatus == "Geç" ? red : endStatus == "Erken" ? green : onTimeColor;
                endStatusRtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = 0, End = endStatus.Length, ColorHex = color });
            }

            var responsible = string.Join(", ", project.AssignedUsers?
                .Where(a => a.Role == EProjectAssignmentRole.Manager)
                .Select(a => a.User?.Name ?? "") ?? new List<string>());

            var labelsString = string.Join(", ", project.Labels?.Select(l => l.Name) ?? new List<string>());

            var subProjectsString = string.Join(", ", project.ChildProjects?.Select(c => c.Title) ?? new List<string>());

            var statusText = project.Status switch
            {
                EProjectStatus.Active => "Aktif",
                EProjectStatus.Planned => "Planlandı",
                EProjectStatus.Inactive => "Pasif",
                EProjectStatus.WaitingForApproval => "Onay Bekliyor",
                EProjectStatus.Completed => "Tamamlandı",
                _ => project.Status.ToString()
            };

            var row = new List<object>
            {
                project.Title,
                project.Code,
                responsible,
                project.PlannedStartDate?.ToString("yyyy-MM-dd") ?? "",
                project.StartedAt?.ToString("yyyy-MM-dd") ?? "",
                startStatusRtc,
                project.PlannedDeadline?.ToString("yyyy-MM-dd") ?? "",
                project.EndAt?.ToString("yyyy-MM-dd") ?? "",
                endStatusRtc,
                plannedDays?.ToString() ?? "",
                actualDays?.ToString() ?? "",
                startDeviation?.ToString() ?? "",
                endDeviation?.ToString() ?? "",
                deviationDays?.ToString() ?? "",
                deviationPercentage.HasValue ? $"{deviationPercentage.Value:F2}%" : "",
                statusText,
                labelsString,
                subProjectsString
            };

            dataRows.Add(row);
        }

        var fileContents = _excelHelper.GenerateExcel(headers, dataRows, "Proje Zaman Gecikme Raporu");

        return fileContents;
    }

    public async Task<ReportDto> ExportSaveTaskReport(QueryTaskForm filters, string webRootPath)
    {
        filters.PageSize = 10000;
        filters.Page = 1;

        var tasksResult = await _taskService.Query(filters);
        var tasks = tasksResult.Data;

        var headers = new List<string>
        {
            "Görev Kodu",
            "Görev Adı",
            "Proje Adı",
            "Planlanan Başlangıç Tarihi",
            "Gerçekleşen Başlangıç Tarihi",
            "Başlangıç Durumu",
            "Planlanan Bitiş Tarihi",
            "Gerçekleşen Bitiş Tarihi",
            "Bitiş Durumu",
            "Planlanan Saat",
            "Gerçekleşen Saat",
            "Saat Sapması",
            "Sapma Yüzdesi",
            "Durum",
            "Atanan Kullanıcılar",
            "Etiketler"
        };

        var dataRows = new List<List<object>>();

        foreach (var task in tasks)
        {
            var startDeviation = task.ActualStartDate.HasValue && task.PlannedStartDate.HasValue
                ? (task.ActualStartDate.Value.ToDateTime(TimeOnly.MinValue) - task.PlannedStartDate.Value.ToDateTime(TimeOnly.MinValue)).Days
                : (int?)null;

            var endDeviation = task.ActualEndDate.HasValue && task.PlannedEndDate.HasValue
                ? (task.ActualEndDate.Value.ToDateTime(TimeOnly.MinValue) - task.PlannedEndDate.Value.ToDateTime(TimeOnly.MinValue)).Days
                : (int?)null;

            var hoursDeviation = task.ActualHours.HasValue && task.PlannedHours.HasValue
                ? task.ActualHours.Value - task.PlannedHours.Value
                : (decimal?)null;

            var deviationPercentage = task.ActualHours.HasValue && task.PlannedHours.HasValue && task.PlannedHours.Value > 0
                ? ((task.ActualHours.Value - task.PlannedHours.Value) / task.PlannedHours.Value) * 100
                : (decimal?)null;

            var startStatus = startDeviation.HasValue
                ? (startDeviation.Value == 0 ? "Zamanında" : startDeviation.Value > 0 ? "Geç" : "Erken")
                : "";

            var endStatus = endDeviation.HasValue
                ? (endDeviation.Value == 0 ? "Zamanında" : endDeviation.Value > 0 ? "Geç" : "Erken")
                : "";

            const string red = "#FF0000";
            const string green = "#00FF00";
            const string onTimeColor = "#000000";

            var startStatusRtc = new NpoiExcelHelper.RichTextCell();
            startStatusRtc.Text = startStatus;
            if (!string.IsNullOrEmpty(startStatus))
            {
                string color = startStatus == "Geç" ? red : startStatus == "Erken" ? green : onTimeColor;
                startStatusRtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = 0, End = startStatus.Length, ColorHex = color });
            }

            var endStatusRtc = new NpoiExcelHelper.RichTextCell();
            endStatusRtc.Text = endStatus;
            if (!string.IsNullOrEmpty(endStatus))
            {
                string color = endStatus == "Geç" ? red : endStatus == "Erken" ? green : onTimeColor;
                endStatusRtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = 0, End = endStatus.Length, ColorHex = color });
            }

            var assignedUsers = string.Join(", ", task.AssignedUsers?.Select(a => a.Name ?? "") ?? new List<string>());

            var labelsString = string.Join(", ", task.Labels?.Select(l => l.Name) ?? new List<string>());

            var statusText = task.Status switch
            {
                ETaskStatus.Todo => "Yapılacak",
                ETaskStatus.InProgress => "Devam Ediyor",
                ETaskStatus.Done => "Tamamlandı",
                ETaskStatus.Inactive => "Pasif",
                ETaskStatus.WaitingForApproval => "Onay Bekliyor",
                _ => task.Status.ToString()
            };

            var row = new List<object>
            {
                task.Code,
                task.Title,
                task.Project?.Name ?? "",
                task.PlannedStartDate?.ToString("yyyy-MM-dd") ?? "",
                task.ActualStartDate?.ToString("yyyy-MM-dd") ?? "",
                startStatusRtc,
                task.PlannedEndDate?.ToString("yyyy-MM-dd") ?? "",
                task.ActualEndDate?.ToString("yyyy-MM-dd") ?? "",
                endStatusRtc,
                task.PlannedHours?.ToString() ?? "",
                task.ActualHours?.ToString() ?? "",
                hoursDeviation?.ToString() ?? "",
                deviationPercentage.HasValue ? $"{deviationPercentage.Value:F2}%" : "",
                statusText,
                assignedUsers,
                labelsString
            };

            dataRows.Add(row);
        }

        var fileContents = _excelHelper.GenerateExcel(headers, dataRows, "Görev Raporu");

        var reportsPath = Path.Combine(webRootPath, "reports");
        if (!Directory.Exists(reportsPath))
        {
            Directory.CreateDirectory(reportsPath);
        }

        var defaultFileBase = "Tasks";
        var fileNameBase = "Tasks";
        var fileName = $"{fileNameBase}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        var filePath = Path.Combine(reportsPath, fileName);

        await File.WriteAllBytesAsync(filePath, fileContents);

        var defaultReportName = "Tasks Report";
        var reportName = defaultReportName;
        var report = new Report
        {
            Name = reportName,
            File = $"/reports/{fileName}",
            Type = EReportType.TaskReport
        };

        _reportRepository.Create(report);
        await _reportRepository.SaveChangesAsync();

        return ReportMapper.Map(report);
    }
}
