namespace PMM.Data.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }

        public ICollection<ProjectAssignment> ProjectAssignments { get; set; }
        public ICollection<TaskAssignment> TaskAssignments { get; set; }

    }
}
