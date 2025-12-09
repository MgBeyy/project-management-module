using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace PMM.Domain.Forms
{
    public class GenerateReportForm
    {
        [Required]
        public EReportType Type { get; set; }
        public string? Name { get; set; }
        public JsonElement? Filters { get; set; }
    }
}