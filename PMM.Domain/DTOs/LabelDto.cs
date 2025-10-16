namespace PMM.Domain.DTOs
{
    public class LabelDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Color { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}
