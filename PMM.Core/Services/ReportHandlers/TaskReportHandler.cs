using Microsoft.EntityFrameworkCore;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Helpers;
using PMM.Core.Mappers;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Text.Json;

namespace PMM.Core.Services.ReportHandlers
{
    public class TaskReportHandler : IReportHandler
    {
        private readonly ITaskService _taskService;
        private readonly NpoiExcelHelper _excelHelper;
        private readonly IReportRepository _reportRepository;

        public TaskReportHandler(ITaskService taskService, NpoiExcelHelper excelHelper, IReportRepository reportRepository)
        {
            _taskService = taskService;
            _excelHelper = excelHelper;
            _reportRepository = reportRepository;
        }

        public EReportType Type => EReportType.TaskReport;

        public async Task<ReportDto> HandleAsync(JsonElement filters, string? name, string webRootPath)
        {
            var queryFilters = filters.Deserialize<QueryTaskForm>() ?? new QueryTaskForm();
            queryFilters.PageSize = 10000;
            queryFilters.Page = 1;

            var tasksResult = await _taskService.Query(queryFilters);
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

            var defaultFileBase = "Görevler";
            var fileNameBase = name ?? defaultFileBase;
            var fileName = $"{fileNameBase}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            var filePath = Path.Combine(reportsPath, fileName);

            await File.WriteAllBytesAsync(filePath, fileContents);

            var defaultReportName = "Görev Raporu";
            var reportName = name ?? defaultReportName;
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
}