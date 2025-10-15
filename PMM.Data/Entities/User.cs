namespace PMM.Data.Entities
{
    public class User : _BaseEntity
    {
        public string Name { get; set; }
        public string Email { get; set; }

        public ICollection<ProjectAssignment> ProjectAssignments { get; set; }
        public ICollection<TaskAssignment> TaskAssignments { get; set; }
        public ICollection<Activity> Activities { get; set; }
    }
}
