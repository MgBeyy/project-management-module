namespace PMM.Data.Entities.Interfaces
{
    public interface IAuditable
    {
        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}
