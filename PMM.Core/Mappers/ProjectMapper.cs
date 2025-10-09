using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;
using PMM.Data.Enums;

namespace PMM.Core.Mappers
{
    public class ProjectMapper
    {
        public static Project Map(CreateProjectForm form)
        {
            return new Project
            {
                Code = form.Code,
                Title = form.Title,
                PlannedStartDate = form.PlannedStartDate,
                PlannedDeadline = form.PlannedDeadline,
                PlannedHours = form.PlannedHours,
                StartedAt = form.StartedAt,
                EndAt = form.EndAt,
                Status = (EProjectStatus)form.Status,
                Priority = form.Priority,
                ClientId = form.ClientId,
            };
        }

        public static ProjectDto Map(Project project)
        {
            return new ProjectDto
            {
                Id = project.Id,
                Code = project.Code,
                Title = project.Title,
                PlannedStartDate = project.PlannedStartDate,
                PlannedDeadline = project.PlannedDeadline,
                PlannedHours = project.PlannedHours,
                StartedAt = project.StartedAt,
                EndAt = project.EndAt,
                Status = project.Status,
                Priority = project.Priority,
                ParentProjectIds = project.ParentRelations?
                    .Select(pr => pr.ParentProjectId)
                    .ToList(),
                ClientId = project.ClientId,
                Labels = project.ProjectLabels?
                    .Select(pl => LabelMapper.Map(pl.Label))
                    .ToList(),
                CreatedAt = project.CreatedAt,
                CreatedById = project.CreatedById,
                UpdatedAt = project.UpdatedAt,
                UpdatedById = project.UpdatedById,
            };
        }

        public static List<ProjectDto> Map(List<Project> projects)
        {
            return projects.Select(p => Map(p)).ToList();
        }

        public static DetailedProjectDto DetailedMap(Project project)
        {
            return new DetailedProjectDto
            {
                Id = project.Id,
                Code = project.Code,
                Title = project.Title,
                PlannedStartDate = project.PlannedStartDate,
                PlannedDeadline = project.PlannedDeadline,
                PlannedHours = project.PlannedHours,
                StartedAt = project.StartedAt,
                EndAt = project.EndAt,
                Status = project.Status,
                Priority = project.Priority,
                ClientId = project.ClientId,
                Labels = project.ProjectLabels?
                    .Select(pl => LabelMapper.Map(pl.Label))
                    .ToList(),
                CreatedAt = project.CreatedAt,
                CreatedById = project.CreatedById,
                UpdatedAt = project.UpdatedAt,
                UpdatedById = project.UpdatedById,
            };
        }

        public static Project Map(UpdateProjectForm form, Project project)
        {
            project.Title = form.Title;
            project.PlannedStartDate = form.PlannedStartDate;
            project.PlannedDeadline = form.PlannedDeadline;
            project.PlannedHours = form.PlannedHours;
            project.StartedAt = form.StartedAt;
            project.EndAt = form.EndAt;
            project.Status = (EProjectStatus)form.Status;
            project.Priority = form.Priority;
            return project;
        }
    }
}
