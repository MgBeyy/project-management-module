namespace PMM.Domain.DTOs
{
    public class ReportDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string File { get; set; }
        public int CreatedById { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}