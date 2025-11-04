using PMM.Core.Helpers;
using PMM.Domain.DTOs;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.Core.Services;

public class ReportService : IReportService
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;
    private readonly NpoiExcelHelper _excelHelper;

    public ReportService(IProjectService projectService, ITaskService taskService, NpoiExcelHelper excelHelper)
    {
        _projectService = projectService;
        _taskService = taskService;
        _excelHelper = excelHelper;
    }

    public async Task<byte[]> ExportProjectsReport(QueryProjectForm filters)
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
            "Proje Adý",
            "Planlanan Baþlagýç Tarihi",
            "Gerçekleþen Baþlagýç Tarihi",
            "Planlanan Bitiþ Tarihi",
            "Gerçekleþen Bitiþ Tarihi",
            "Planlanan Çalýþma Saati",
            "Gerçekleþen Çalýþma Saati",
            "Baþlangýç Sapmasý",
            "Bitiþ Sapma",
            "Saat Sapmasý",
            "Sapma Yüzdesi",
            "Durum",
            "Proje Sorumlularý",
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
                EProjectStatus.Planned => "Planlandý",
                EProjectStatus.Inactive => "Pasif",
                EProjectStatus.WaitingForApproval => "Onay Bekliyor",
                EProjectStatus.Completed => "Tamamlandý",
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

        return _excelHelper.GenerateExcel(headers, dataRows, "Projects Report");
    }
}