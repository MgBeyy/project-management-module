using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public class ProjectAssignmentMapper
    {
        public static ProjectAssignment Map(CreateProjectAssignmentForm form)
        {
            return new ProjectAssignment
            {
                ProjectId = form.ProjectId,
                UserId = form.UserId,
                Role = form.Role,
                StartedAt = form.StartedAt,
                EndAt = form.EndAt,
                ExpectedHours = form.ExpectedHours,
            };
        }
        public static ProjectAssignmentDto Map(ProjectAssignment pa)
        {
            return new ProjectAssignmentDto
            {
                Id = pa.Id,
                ProjectId = pa.ProjectId,
                UserId = pa.UserId,
                Role = pa.Role,
                StartedAt = pa.StartedAt,
                EndAt = pa.EndAt,
                SpentHours = pa.SpentHours,
                ExpectedHours = pa.ExpectedHours,
                CreatedAt = pa.CreatedAt,
                CreatedById = pa.CreatedById,
                UpdatedAt = pa.UpdatedAt,
                UpdatedById = pa.UpdatedById,
            };
        }
        public static List<ProjectAssignmentDto> Map(List<ProjectAssignment> pa)
        {
            return pa.Select(p => Map(p)).ToList();
        }
        public static ProjectAssignment Map(UpdateProjectAssignmentForm form, ProjectAssignment pa)
        {
            pa.Role = form.Role;
            pa.StartedAt = form.StartedAt;
            pa.EndAt = form.EndAt;
            pa.ExpectedHours = form.ExpectedHours;
            return pa;
        }
    }
}
