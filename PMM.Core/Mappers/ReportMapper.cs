using PMM.Domain.DTOs;
using PMM.Domain.Entities;

namespace PMM.Core.Mappers
{
    public class ReportMapper
    {
        public static ReportDto Map(Report report)
        {
            return new ReportDto
            {
                Id = report.Id,
                Name = report.Name,
                File = report.File,
                CreatedById = report.CreatedById,
                CreatedAt = report.CreatedAt,
                UpdatedById = report.UpdatedById,
                UpdatedAt = report.UpdatedAt
            };
        }

        public static List<ReportDto> Map(List<Report> reports)
        {
            return reports.Select(r => Map(r)).ToList();
        }
    }
}