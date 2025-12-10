using Microsoft.Extensions.Configuration;
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
    public class EffortAndCapacityReportHandler : IReportHandler
    {
        private readonly ITaskService _taskService;
        private readonly NpoiExcelHelper _excelHelper;
        private readonly IReportRepository _reportRepository;
        private readonly IConfiguration _configuration;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
        };

        public EffortAndCapacityReportHandler(ITaskService taskService, NpoiExcelHelper excelHelper, IReportRepository reportRepository, IConfiguration configuration)
        {
            _taskService = taskService;
            _excelHelper = excelHelper;
            _reportRepository = reportRepository;
            _configuration = configuration;
        }

        public EReportType Type => EReportType.EffortAndCapacityReport;

        public async Task<ReportDto> HandleAsync(JsonElement filters, string? name, string webRootPath)
        {
            var baseDomain = _configuration["BaseDomain"] ?? "https://localhost:3000"; // Default if not set

            var queryFilters = filters.Deserialize<QueryTaskForm>(_jsonOptions) ?? new QueryTaskForm();
            queryFilters.PageSize = 10000;
            queryFilters.Page = 1;

            var tasksResult = await _taskService.Query(queryFilters);
            var tasks = tasksResult.Data;

            var headers = new List<string>
            {
                "Görev Kodu",
                "Görev Ýsmi",
                "Üst Proje",
                "Proje Kodu",
                "Göreve Atanan Personeller",
                "Planlanan Efor(saat)",
                "Gerçekleþen Efor(saat)",
                "Planlanan baþlangýç Tarihi (saat)",
                "Planlanan Bitiþ Tarihi (saat)",
                "Gerçekleþtirilen Baþlangýç Tarihi (saat)",
                "Gerçekleþtirilen Bitiþ Tarihi (saat)",
                "Planlama Doðruluðu%",
                "Durum",
                "Tamamlanma (%)",
                "Kapasite(1 günde toplam çalýþma saati*gün)",
                "Kapasite Aþýmý(planlanan-kapasite)",
                "Kapasite kullamý %",
                "Öncelik",
                "Baðlý Olduðu Görev",
                "Proje Aðacý"
            };

            var dataRows = new List<List<object>>();

            foreach (var task in tasks)
            {
                // Calculations
                var planningAccuracy = task.ActualHours.HasValue && task.PlannedHours.HasValue && task.PlannedHours.Value > 0
                    ? (task.ActualHours.Value / task.PlannedHours.Value) * 100
                    : (decimal?)null;

                var completionPercent = planningAccuracy; // Assuming completion is based on effort

                // Capacity: Assume 8 hours per day, calculate days between planned start and end
                var capacity = task.PlannedStartDate.HasValue && task.PlannedEndDate.HasValue
                    ? (task.PlannedEndDate.Value.ToDateTime(TimeOnly.MinValue) - task.PlannedStartDate.Value.ToDateTime(TimeOnly.MinValue)).Days * 8
                    : (decimal?)null;

                var capacityExcess = task.PlannedHours.HasValue && capacity.HasValue
                    ? task.PlannedHours.Value - capacity.Value
                    : (decimal?)null;

                var capacityUsage = task.PlannedHours.HasValue && capacity.HasValue && capacity.Value > 0
                    ? (task.PlannedHours.Value / capacity.Value) * 100
                    : (decimal?)null;

                // Status text
                var statusText = task.Status switch
                {
                    ETaskStatus.Todo => "Yapýlacak",
                    ETaskStatus.InProgress => "Devam Ediyor",
                    ETaskStatus.Done => "Tamamlandý",
                    ETaskStatus.Inactive => "Pasif",
                    ETaskStatus.WaitingForApproval => "Onay Bekliyor",
                    _ => task.Status.ToString()
                };

                // Assigned users
                var assignedUsers = string.Join(", ", task.AssignedUsers?.Select(a => a.Name ?? "") ?? new List<string>());

                // Priority (assuming task has priority, but from context it might not; placeholder)
                var priorityText = "Orta"; // Placeholder, adjust if task has priority

                // Related task (parent task)
                var relatedTask = task.ParentTaskId.HasValue ? $"Görev {task.ParentTaskId}" : "";

                // Project tree (clickable link to project)
                var projectCode = task.ProjectCode ?? "";
                var projectTree = string.IsNullOrEmpty(projectCode) ? new NpoiExcelHelper.HyperlinkCell { Text = "", Url = "" } : new NpoiExcelHelper.HyperlinkCell
                {
                    Text = projectCode,
                    Url = $"{baseDomain}/pm-module/projects/{projectCode}"
                };

                // Color for capacity excess
                var capacityExcessRtc = new NpoiExcelHelper.RichTextCell();
                capacityExcessRtc.Text = capacityExcess?.ToString("F2") ?? "";
                if (capacityExcess.HasValue)
                {
                    string color = capacityExcess.Value > 0 ? "#FF0000" : "#00FF00"; // Red if excess, green if not
                    capacityExcessRtc.Ranges.Add(new NpoiExcelHelper.FontRange { Start = 0, End = capacityExcessRtc.Text.Length, ColorHex = color });
                }

                var row = new List<object>
                {
                    task.Code,
                    task.Title,
                    task.Project?.Name ?? "",
                    projectCode, // Proje Kodu
                    assignedUsers,
                    task.PlannedHours?.ToString("F2") ?? "",
                    task.ActualHours?.ToString("F2") ?? "",
                    task.PlannedStartDate?.ToString("yyyy-MM-dd") ?? "",
                    task.PlannedEndDate?.ToString("yyyy-MM-dd") ?? "",
                    task.ActualStartDate?.ToString("yyyy-MM-dd") ?? "",
                    task.ActualEndDate?.ToString("yyyy-MM-dd") ?? "",
                    planningAccuracy.HasValue ? $"{planningAccuracy.Value:F2}%" : "",
                    statusText,
                    completionPercent.HasValue ? $"{completionPercent.Value:F2}%" : "",
                    capacity?.ToString("F2") ?? "",
                    capacityExcessRtc,
                    capacityUsage.HasValue ? $"{capacityUsage.Value:F2}%" : "",
                    priorityText,
                    relatedTask,
                    projectTree
                };

                dataRows.Add(row);
            }

            var fileContents = _excelHelper.GenerateExcel(headers, dataRows, "Efor ve Kapasite Raporu");

            var reportsPath = Path.Combine(webRootPath, "reports");
            if (!Directory.Exists(reportsPath))
            {
                Directory.CreateDirectory(reportsPath);
            }

            var defaultFileBase = "EforKapasite";
            var fileNameBase = name ?? defaultFileBase;
            var fileName = $"{fileNameBase}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            var filePath = Path.Combine(reportsPath, fileName);

            await File.WriteAllBytesAsync(filePath, fileContents);

            var defaultReportName = "Efor ve Kapasite Raporu";
            var reportName = name ?? defaultReportName;
            var report = new Report
            {
                Name = reportName,
                File = $"/reports/{fileName}",
                Type = EReportType.EffortAndCapacityReport
            };

            _reportRepository.Create(report);
            await _reportRepository.SaveChangesAsync();

            return ReportMapper.Map(report);
        }
    }
}