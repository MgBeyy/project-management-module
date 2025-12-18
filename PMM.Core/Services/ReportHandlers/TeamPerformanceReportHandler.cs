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
    public class TeamPerformanceReportHandler : IReportHandler
    {
        private readonly ITaskService _taskService;
        private readonly NpoiExcelHelper _excelHelper;
        private readonly IReportRepository _reportRepository;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter() }
        };

        public TeamPerformanceReportHandler(ITaskService taskService, NpoiExcelHelper excelHelper, IReportRepository reportRepository)
        {
            _taskService = taskService;
            _excelHelper = excelHelper;
            _reportRepository = reportRepository;
        }

        public EReportType Type => EReportType.TeamPerformanceReport;

        public async Task<ReportDto> HandleAsync(JsonElement filters, string? name, string webRootPath)
        {
            var queryFilters = filters.Deserialize<QueryTaskForm>(_jsonOptions) ?? new QueryTaskForm();
            queryFilters.PageSize = 10000;
            queryFilters.Page = 1;

            var tasksResult = await _taskService.Query(queryFilters);
            var tasks = tasksResult.Data;

            // Prepare data for Personel Özeti
            var userSummaries = new Dictionary<int, (string Name, int CompletedTasks, int ActiveTasks)>();

            foreach (var task in tasks)
            {
                if (task.AssignedUsers != null)
                {
                    foreach (var user in task.AssignedUsers)
                    {
                        if (!userSummaries.ContainsKey(user.Id))
                        {
                            userSummaries[user.Id] = (user.Name ?? "", 0, 0);
                        }

                        var summary = userSummaries[user.Id];
                        if (task.Status == ETaskStatus.Done)
                        {
                            summary.CompletedTasks++;
                        }
                        else if (task.Status == ETaskStatus.InProgress)
                        {
                            summary.ActiveTasks++;
                        }
                        userSummaries[user.Id] = summary;
                    }
                }
            }

            // Sheet 1: Personel Özeti
            var summaryHeaders = new List<string>
            {
                "Personel Kodu",
                "Personel Adý-Soyadý",
                "Ýþ Rolü",
                "Departman/Birim",
                "Toplam Tamamlanan Görev Sayýsý",
                "Toplam Aktif Görev Sayýsý"
            };

            var summaryDataRows = new List<List<object>>();
            foreach (var summary in userSummaries.Values)
            {
                var row = new List<object>
                {
                    "", // Personel Kodu
                    summary.Name, // Personel Adý-Soyadý
                    "", // Ýþ Rolü
                    "", // Departman/Birim
                    summary.CompletedTasks.ToString(),
                    summary.ActiveTasks.ToString()
                };
                summaryDataRows.Add(row);
            }

            // Sheet 2: Görev Detaylarý
            var detailHeaders = new List<string>
            {
                "Personel Kodu",
                "Personel Adý-Soyadý",
                "Proje Adý/Kodu",
                "Proje Türü",
                "Görev Kodu",
                "Görevin Açýklamasý",
                "Durum",
                "Planlanan Efor",
                "Gerçekleþen Efor",
                "Ýlerleme (%)",
                "Görev Revizyon Sayýsý",
                "Hata Sayýsý",
                "Risk Durumu",
                "Görev Tipi",
                "Baðlý Olduðu Görevler",
                "Onay Durumu"
            };

            var detailDataRows = new List<List<object>>();
            foreach (var task in tasks)
            {
                if (task.AssignedUsers != null)
                {
                    foreach (var user in task.AssignedUsers)
                    {
                        var progress = task.ActualHours.HasValue && task.PlannedHours.HasValue && task.PlannedHours.Value > 0
                            ? (task.ActualHours.Value / task.PlannedHours.Value) * 100
                            : (decimal?)null;

                        var statusText = task.Status switch
                        {
                            ETaskStatus.Todo => "Yapýlacak",
                            ETaskStatus.InProgress => "Devam Ediyor",
                            ETaskStatus.Done => "Tamamlandý",
                            ETaskStatus.Inactive => "Pasif",
                            ETaskStatus.WaitingForApproval => "Onay Bekliyor",
                            _ => task.Status.ToString()
                        };

                        var row = new List<object>
                        {
                            "", // Personel Kodu
                            user.Name ?? "", // Personel Adý-Soyadý
                            task.Project?.Name ?? task.ProjectCode ?? "", // Proje Adý/Kodu
                            "", // Proje Türü
                            task.Code, // Görev Kodu
                            task.Description ?? "", // Görevin Açýklamasý
                            statusText, // Durum
                            task.PlannedHours?.ToString("F2") ?? "", // Planlanan Efor
                            task.ActualHours?.ToString("F2") ?? "", // Gerçekleþen Efor
                            progress.HasValue ? $"{progress.Value:F2}%" : "", // Ýlerleme (%)
                            "", // Görev Revizyon Sayýsý
                            "", // Hata Sayýsý
                            "", // Risk Durumu
                            "", // Görev Tipi
                            "", // Baðlý Olduðu Görevler
                            "" // Onay Durumu
                        };
                        detailDataRows.Add(row);
                    }
                }
            }

            var sheets = new List<(List<string> headers, List<List<object>> dataRows, string sheetName)>
            {
                (summaryHeaders, summaryDataRows, "Personel Özeti"),
                (detailHeaders, detailDataRows, "Görev Detaylarý")
            };

            var fileContents = _excelHelper.GenerateExcelWithMultipleSheets(sheets);

            var reportsPath = Path.Combine(webRootPath, "reports");
            if (!Directory.Exists(reportsPath))
            {
                Directory.CreateDirectory(reportsPath);
            }

            var defaultFileBase = "TakimPerformans";
            var fileNameBase = name ?? defaultFileBase;
            var fileName = $"{fileNameBase}_{DateTime.Now:yyyyMMddHHmmss}.xlsx";
            var filePath = Path.Combine(reportsPath, fileName);

            await File.WriteAllBytesAsync(filePath, fileContents);

            var defaultReportName = "Takým Performans Raporu";
            var reportName = name ?? defaultReportName;
            var report = new Report
            {
                Name = reportName,
                File = $"/reports/{fileName}",
                Type = EReportType.TeamPerformanceReport
            };

            _reportRepository.Create(report);
            await _reportRepository.SaveChangesAsync();

            return ReportMapper.Map(report);
        }
    }
}