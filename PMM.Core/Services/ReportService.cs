using Microsoft.EntityFrameworkCore;
using PMM.Core.Common;
using PMM.Core.Helpers;
using PMM.Core.Mappers;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;

namespace PMM.Core.Services;

public class ReportService : IReportService
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;
    private readonly NpoiExcelHelper _excelHelper;
    private readonly IReportRepository _reportRepository;

    public ReportService(IProjectService projectService, ITaskService taskService, NpoiExcelHelper excelHelper, IReportRepository reportRepository)
    {
        _projectService = projectService;
        _taskService = taskService;
        _excelHelper = excelHelper;
        _reportRepository = reportRepository;
    }

    public async Task<ReportDto> ExportProjectsReport(QueryProjectForm filters, string webRootPath)
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
            "Proje Kodu",
            "Proje Adı",
            "Planlanan Başlagıç Tarihi",
            "Gerçekleşen Başlagıç Tarihi",
            "Planlanan Bitiş Tarihi",
            "Gerçekleşen Bitiş Tarihi",
            "Planlanan çalışma Saati",
            "Gerçekleşen çalışma Saati",
            "Başlangıç Sapması",
            "Bitiş Sapması",
            "Saat Sapması",
            "Sapma Yüzdesi",
            "Durum",
            "Proje Sorumluları",
            "Etiketler"
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

            var responsible = string.Join(", ", project.AssignedUsers?
                .Where(a => a.Role == EProjectAssignmentRole.Manager)
                .Select(a => a.User.Name) ?? new List<string>());

            var rtc = new NpoiExcelHelper.RichTextCell();
            int currentIndex = 0;
            foreach (var label in project.Labels ?? new List<LabelDto>())
            {
                string text = label.Name + " ";
                rtc.Text += text;
                rtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = currentIndex, End = currentIndex + text.Length, ColorHex = label.Color });
                currentIndex += text.Length;
            }

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
                project.Code,
                project.Title,
                project.PlannedStartDate?.ToString("yyyy-MM-dd") ?? "",
                project.StartedAt?.ToString("yyyy-MM-dd") ?? "",
                project.PlannedDeadline?.ToString("yyyy-MM-dd") ?? "",
                project.EndAt?.ToString("yyyy-MM-dd") ?? "",
                project.PlannedHours?.ToString() ?? "",
                project.ActualHours?.ToString() ?? "",
                startDeviation?.ToString() ?? "",
                endDeviation?.ToString() ?? "",
                hoursDeviation?.ToString() ?? "",
                deviationPercentage.HasValue ? $"{deviationPercentage.Value:F2}%" : "",
                statusText,
                responsible,
                rtc
            };

            dataRows.Add(row);
        }

        var fileContents = _excelHelper.GenerateExcel(headers, dataRows, "Projects Report");

        var reportsPath = Path.Combine(webRootPath, "reports");
        if (!Directory.Exists(reportsPath))
        {
            Directory.CreateDirectory(reportsPath);
        }

        var fileName = $"Projects_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        var filePath = Path.Combine(reportsPath, fileName);

        await File.WriteAllBytesAsync(filePath, fileContents);

        var report = new Report
        {
            Name = $"Projects Report - {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
            File = $"/reports/{fileName}"
        };

        _reportRepository.Create(report);
        await _reportRepository.SaveChangesAsync();

        return ReportMapper.Map(report);
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
}
