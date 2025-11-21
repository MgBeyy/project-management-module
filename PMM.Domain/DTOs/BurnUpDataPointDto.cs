namespace PMM.Domain.DTOs
{
    public class BurnUpDataPointDto
    {
        public DateOnly Date { get; set; }
        public decimal TotalScope { get; set; }
        public decimal CompletedWork { get; set; }
        public decimal IdealTrend { get; set; }
    }
}