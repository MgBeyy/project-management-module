using PMM.Core.Helpers;
using PMM.Core.Mappers;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PMM.Core.Services.ReportHandlers
{
    public class ProjectTimeLatencyReportHandler : IReportHandler
    {
        private readonly IProjectService _projectService;
        private readonly NpoiExcelHelper _excelHelper;
        private readonly IReportRepository _reportRepository;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
        };

        public ProjectTimeLatencyReportHandler(IProjectService projectService, NpoiExcelHelper excelHelper, IReportRepository reportRepository)
        {
            _projectService = projectService;
            _excelHelper = excelHelper;
            _reportRepository = reportRepository;
        }

        public EReportType Type => EReportType.ProjectTimeLatency;

        public async Task<ReportDto> HandleAsync(JsonElement filters, string? name, string webRootPath)
        {
            var queryFilters = filters.Deserialize<QueryProjectForm>(_jsonOptions) ?? new QueryProjectForm();
            queryFilters.PageSize = 10000;
            queryFilters.Page = 1;

            var projectsResult = await _projectService.Query(queryFilters);
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
                "Üst Proje",
                "Proje Kodu",
                "Proje Sorumlusu",
                "Planlanan Başlangıç",
                "Planlanan Bitiş",
                "Gerçekleşen Başlangıç",
                "Gerçekleşen Bitiş",
                "Başlangıç Durumu",
                "Bitiş Durumu",
                "Planan Çalışma Günü (saat)",
                "Gerçekleşen Çalışma Günü",
                "Başlangıç Tarihi Sapması",
                "Bitiş Tarihi Sapması",
                "Sapma(Gün)",
                "Sapma Yüzdesi",
                "Durum",
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

                var responsible = project.AssignedUsers?
                    .FirstOrDefault(a => a.Role == EProjectAssignmentRole.Manager)?.User?.Name ?? "";

                var parentProjectsString = string.Join(", ", project.ParentProjects?.Select(p => p.Title) ?? new List<string>());

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
                    parentProjectsString,
                    project.Code,
                    responsible,
                    project.PlannedStartDate?.ToString("yyyy-MM-dd") ?? "",
                    project.PlannedDeadline?.ToString("yyyy-MM-dd") ?? "",
                    project.StartedAt?.ToString("yyyy-MM-dd") ?? "",
                    project.EndAt?.ToString("yyyy-MM-dd") ?? "",
                    startStatusRtc,
                    endStatusRtc,
                    plannedDays?.ToString() ?? "",
                    actualDays?.ToString() ?? "",
                    startDeviation?.ToString() ?? "",
                    endDeviation?.ToString() ?? "",
                    deviationDays?.ToString() ?? "",
                    deviationPercentage.HasValue ? $"{deviationPercentage.Value:F2}%" : "",
                    statusText,
                    labelsString
                };

                dataRows.Add(row);
            }

            var fileContents = _excelHelper.GenerateExcel(headers, dataRows, "Proje Zaman Gecikme Raporu");

            var reportsPath = Path.Combine(webRootPath, "reports");
            if (!Directory.Exists(reportsPath))
            {
                Directory.CreateDirectory(reportsPath);
            }

            var defaultFileBase = "Projects";
            var fileNameBase = name ?? defaultFileBase;
            var fileName = $"{fileNameBase}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            var filePath = Path.Combine(reportsPath, fileName);

            await File.WriteAllBytesAsync(filePath, fileContents);

            var defaultReportName = "Projects Report";
            var reportName = name ?? defaultReportName;
            var report = new Report
            {
                Name = reportName,
                File = $"/reports/{fileName}",
                Type = EReportType.ProjectTimeLatency
            };

            _reportRepository.Create(report);
            await _reportRepository.SaveChangesAsync();

            return ReportMapper.Map(report);
        }
    }
}