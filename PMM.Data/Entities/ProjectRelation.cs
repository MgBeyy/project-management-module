namespace PMM.Data.Entities
{
    public class ProjectRelation
    {
        public int Id { get; set; }

        public int ParentProjectId { get; set; }
        public virtual Project ParentProject { get; set; }

        public int ChildProjectId { get; set; }
        public virtual Project ChildProject { get; set; }

        public DateTime CreatedAt { get; set; }
        public int CreatedById { get; set; }
        public virtual User CreatedByUser { get; set; }

        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
        public virtual User? UpdatedByUser { get; set; }
    }
}
