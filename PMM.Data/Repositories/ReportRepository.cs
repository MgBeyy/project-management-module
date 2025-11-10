using Microsoft.Extensions.Logging;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;

namespace PMM.Data.Repositories
{
    public class ReportRepository : _BaseRepository<Report>, IReportRepository
    {
        public ReportRepository(ApplicationDbContext context, ILogger<ReportRepository> logger)
            : base(context, logger)
        {
        }
    }
}