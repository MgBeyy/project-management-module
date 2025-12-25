using PMM.Domain.Attributes;
using PMM.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PMM.Domain.Forms
{
    public class CreateMachineForm
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Category { get; set; }
        [Required]
        public string Brand { get; set; }
        [Required]
        public string Model { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Saatlik maliyet negatif bir deðer alamaz.")]
        public decimal? HourlyCost { get; set; }
        public string Currency { get; set; } = "TL";
        [Range(0, double.MaxValue, ErrorMessage = "Satýn alma fiyatý negatif bir deðer alamaz.")]
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public bool IsActive { get; set; } = true;
        [JsonConverter(typeof(JsonStringEnumConverter))]
        [ValidEnum(ErrorMessage = "Geçerli bir makine durumu seçiniz.")]
        public EMachineStatus Status { get; set; } = EMachineStatus.Available;
    }
}