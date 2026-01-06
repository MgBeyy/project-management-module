using PMM.Domain.Interfaces;

namespace PMM.Domain.Entities
{
    public class User : ISoftDeletable
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; } = true;
        public decimal? HourlyRate { get; set; }
        public string Currency { get; set; }

        public ICollection<ProjectAssignment> ProjectAssignments { get; set; }
        public ICollection<TaskAssignment> TaskAssignments { get; set; }
        public ICollection<Activity> Activities { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedById { get; set; }
        public virtual User? DeletedByUser { get; set; }

    }
}
