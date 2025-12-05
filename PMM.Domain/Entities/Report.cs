using PMM.Domain.Enums;

namespace PMM.Domain.Entities
{
    public class Report : _BaseEntity
    {
        public string Name { get; set; }
        public string File { get; set; }
        public EReportType Type { get; set; }
    }
}