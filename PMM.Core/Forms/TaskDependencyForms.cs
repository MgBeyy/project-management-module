using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Forms
{
    public class CreateTaskDependencyForm
    {
        [Required]
        public int BlockingTaskId { get; set; }

        [Required]
        public int BlockedTaskId { get; set; }
    }

    public class ManageTaskDependenciesForm
    {
        [Required]
        public int TaskId { get; set; }
        
        public List<int> BlockedTaskIds { get; set; } = new();
    }
}