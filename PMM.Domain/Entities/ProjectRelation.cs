namespace PMM.Domain.Entities
{
    public class ProjectRelation : _BaseEntity
    {
        public int ParentProjectId { get; set; }
        public virtual Project ParentProject { get; set; }

        public int ChildProjectId { get; set; }
        public virtual Project ChildProject { get; set; }
    }
}
