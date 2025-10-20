using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Enums;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class ProjectService : _BaseService, IProjectService
    {
        private readonly ILogger<ProjectService> _logger;
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectRelationRepository _projectRelationRepository;
        private readonly IProjectLabelRepository _projectLabelRepository;
        private readonly ILabelRepository _labelRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProjectAssignmentRepository _projectAssignmentRepository;

        public ProjectService(IProjectRepository projectRepository,
            IProjectRelationRepository projectRelationRepository,
            IProjectLabelRepository projectLabelRepository,
            ILabelRepository labelRepository,
            IClientRepository clientRepository,
            ILogger<ProjectService> logger,
            IUserRepository userRepository,
            IProjectAssignmentRepository projectAssignmentRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _logger = logger;
            _projectRepository = projectRepository;
            _projectRelationRepository = projectRelationRepository;
            _projectLabelRepository = projectLabelRepository;
            _labelRepository = labelRepository;
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
        }

        public async Task<ProjectDto> AddProjectAsync(CreateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var existing = await _projectRepository.GetByCodeAsync(form.Code);
            if (existing is not null)
                throw new BusinessException("Bu kod ile kayıtlı bir proje bulunmaktadır.");

            if (form.PlannedDeadline is not null)
            {
                if (form.PlannedDeadline < form.PlannedStartDate)
                    throw new BusinessException("Planlanan bitirme tarihi başlama tarihinden önce olamaz.");
            }
            if (form.StartedAt is not null && form.EndAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Proje bitirme tarihi başlama tarihinden önce olamaz.");
            }
            if (form.Status is null)
            {
                if (form.PlannedStartDate != null && form.PlannedStartDate < DateOnly.FromDateTime(DateTime.UtcNow))
                {
                    form.Status = EProjectStatus.Active;
                }
                else
                {
                    form.Status = EProjectStatus.Planned;
                }
            }

            if (form.ParentProjectIds != null && form.ParentProjectIds.Count != 0)
            {
                foreach (var parentId in form.ParentProjectIds)
                    _ = await _projectRepository.GetByIdAsync(parentId) ?? throw new NotFoundException($"ID {parentId} ile ebeveyn proje bulunamadı!");
            }

            if (form.ClientId is not null)
                _ = await _clientRepository.GetByIdAsync(form.ClientId) ?? throw new NotFoundException("Müşteri Bulunamadı!");

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                    _ = await _labelRepository.GetByIdAsync(labelId) ?? throw new NotFoundException($"ID {labelId} ile etiket bulunamadı!");
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                foreach (var assignedUser in form.AssignedUsers)
                {
                    _ = await _userRepository.GetByIdAsync(assignedUser.UserId) ?? throw new NotFoundException($"ID {assignedUser.UserId} ile kullanıcı bulunamadı!");

                    if (assignedUser.EndAt is not null && assignedUser.StartedAt is not null)
                    {
                        if (assignedUser.EndAt < assignedUser.StartedAt)
                            throw new BusinessException($"Kullanıcı {assignedUser.UserId} için projeden ayrılma tarihi başlama tarihinden önce olamaz.");
                    }
                }
            }

            var project = ProjectMapper.Map(form);
            project.CreatedAt = DateTime.UtcNow;
            project.CreatedById = LoggedInUser.Id;
            _projectRepository.Create(project);
            await _projectRepository.SaveChangesAsync();

            // Parent relations oluşturma
            if (form.ParentProjectIds != null && form.ParentProjectIds.Count != 0)
            {
                foreach (var parentId in form.ParentProjectIds)
                {
                    var relation = new ProjectRelation
                    {
                        ParentProjectId = parentId,
                        ChildProjectId = project.Id,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _projectRelationRepository.Create(relation);
                }
                await _projectRelationRepository.SaveChangesAsync();
            }

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                {
                    var projectLabel = new ProjectLabel
                    {
                        ProjectId = project.Id,
                        LabelId = labelId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _projectLabelRepository.Create(projectLabel);
                }
                await _projectLabelRepository.SaveChangesAsync();
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                foreach (var assignedUser in form.AssignedUsers)
                {
                    var projectAssignment = new ProjectAssignment
                    {
                        ProjectId = project.Id,
                        UserId = assignedUser.UserId,
                        Role = assignedUser.Role,
                        StartedAt = assignedUser.StartedAt,
                        EndAt = assignedUser.EndAt,
                        ExpectedHours = assignedUser.ExpectedHours,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _projectAssignmentRepository.Create(projectAssignment);
                }
                await _projectAssignmentRepository.SaveChangesAsync();
            }

            var createdProject = await _projectRepository.Query(p => p.Id == project.Id)
                .Include(p => p.ParentRelations)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .FirstOrDefaultAsync();

            return ProjectMapper.Map(createdProject);
        }

        public async Task<ProjectDto> EditProjectAsync(int projectId, UpdateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new NotFoundException("Proje Bulunamadı!");

            if (form.PlannedDeadline is not null && form.PlannedStartDate is not null)
            {
                if (form.PlannedDeadline < form.PlannedStartDate)
                    throw new BusinessException("Planlanan bitirme tarihi başlama tarihinden önce olamaz.");
            }
            if (form.StartedAt is not null && form.EndAt is not null)
            {
                if (form.EndAt < form.StartedAt)
                    throw new BusinessException("Proje bitirme tarihi başlama tarihinden önce olamaz.");
            }

            if (form.ParentProjectIds != null && form.ParentProjectIds.Count != 0)
            {
                foreach (var parentId in form.ParentProjectIds)
                {
                    if (parentId == projectId)
                        throw new BusinessException("Bir proje kendi parent'ı olamaz!");

                    _ = await _projectRepository.GetByIdAsync(parentId) ?? throw new NotFoundException($"ID {parentId} ile üst proje bulunamadı!");

                    var childProjects = await _projectRelationRepository.GetByParentProjectIdAsync(projectId);
                    if (childProjects.Any(c => c.ChildProjectId == parentId))
                        throw new BusinessException("Bir proje, kendi alt projelerinden birine üst proje olarak atanamaz.");
                }
            }

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                    _ = await _labelRepository.GetByIdAsync(labelId) ?? throw new NotFoundException($"ID {labelId} ile etiket bulunamadı!");
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                foreach (var assignedUser in form.AssignedUsers)
                {
                    _ = await _userRepository.GetByIdAsync(assignedUser.UserId) ?? throw new NotFoundException($"ID {assignedUser.UserId} ile kullanıcı bulunamadı!");

                    if (assignedUser.EndAt is not null && assignedUser.StartedAt is not null)
                    {
                        if (assignedUser.EndAt < assignedUser.StartedAt)
                            throw new BusinessException($"Kullanıcı {assignedUser.UserId} için projeden ayrılma tarihi başlama tarihinden önce olamaz.");
                    }
                }
            }

            project = ProjectMapper.Map(form, project);
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedById = LoggedInUser.Id;
            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();

            var existingRelations = await _projectRelationRepository.GetByChildProjectIdAsync(projectId);
            foreach (var relation in existingRelations)
            {
                _projectRelationRepository.Delete(relation);
            }
            await _projectRelationRepository.SaveChangesAsync();

            if (form.ParentProjectIds != null && form.ParentProjectIds.Any())
            {
                foreach (var parentId in form.ParentProjectIds)
                {
                    var relation = new ProjectRelation
                    {
                        ParentProjectId = parentId,
                        ChildProjectId = project.Id,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _projectRelationRepository.Create(relation);
                }
                await _projectRelationRepository.SaveChangesAsync();
            }

            var existingLabels = await _projectLabelRepository.GetByProjectIdAsync(projectId);
            foreach (var projectLabel in existingLabels)
            {
                _projectLabelRepository.Delete(projectLabel);
            }
            await _projectLabelRepository.SaveChangesAsync();

            if (form.LabelIds != null && form.LabelIds.Any())
            {
                foreach (var labelId in form.LabelIds)
                {
                    var projectLabel = new ProjectLabel
                    {
                        ProjectId = project.Id,
                        LabelId = labelId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _projectLabelRepository.Create(projectLabel);
                }
                await _projectLabelRepository.SaveChangesAsync();
            }

            var existingAssignments = await _projectAssignmentRepository.GetByProjectIdAsync(projectId);

            if (form.AssignedUsers != null)
            {
                var currentUserIds = existingAssignments.Select(a => a.UserId).ToHashSet();
                var newUserIds = form.AssignedUsers.Select(a => a.UserId).ToHashSet();

                var assignmentsToDelete = existingAssignments.Where(a => !newUserIds.Contains(a.UserId)).ToList();
                foreach (var assignment in assignmentsToDelete)
                {
                    _projectAssignmentRepository.Delete(assignment);
                }

                foreach (var assignedUser in form.AssignedUsers)
                {
                    var existingAssignment = existingAssignments.FirstOrDefault(a => a.UserId == assignedUser.UserId);

                    if (existingAssignment != null)
                    {
                        // Mevcut atamayı güncelle
                        var hasChanges = existingAssignment.Role != assignedUser.Role ||
                                       existingAssignment.StartedAt != assignedUser.StartedAt ||
                                       existingAssignment.EndAt != assignedUser.EndAt ||
                                       existingAssignment.ExpectedHours != assignedUser.ExpectedHours;

                        if (hasChanges)
                        {
                            existingAssignment.Role = assignedUser.Role;
                            existingAssignment.StartedAt = assignedUser.StartedAt;
                            existingAssignment.EndAt = assignedUser.EndAt;
                            existingAssignment.ExpectedHours = assignedUser.ExpectedHours;
                            existingAssignment.UpdatedAt = DateTime.UtcNow;
                            existingAssignment.UpdatedById = LoggedInUser.Id;
                            _projectAssignmentRepository.Update(existingAssignment);
                        }
                    }
                    else
                    {
                        var newAssignment = new ProjectAssignment
                        {
                            ProjectId = project.Id,
                            UserId = assignedUser.UserId,
                            Role = assignedUser.Role,
                            StartedAt = assignedUser.StartedAt,
                            EndAt = assignedUser.EndAt,
                            ExpectedHours = assignedUser.ExpectedHours,
                            CreatedAt = DateTime.UtcNow,
                            CreatedById = LoggedInUser.Id
                        };
                        _projectAssignmentRepository.Create(newAssignment);
                    }
                }

                await _projectAssignmentRepository.SaveChangesAsync();
            }
            else
            {
                foreach (var assignment in existingAssignments)
                {
                    _projectAssignmentRepository.Delete(assignment);
                }
                await _projectAssignmentRepository.SaveChangesAsync();
            }

            var updatedProject = await _projectRepository.Query(p => p.Id == project.Id)
                .Include(p => p.ParentRelations)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .FirstOrDefaultAsync();

            return ProjectMapper.Map(updatedProject);
        }

        public async Task<PagedResult<ProjectDto>> Query(QueryProjectForm form)
        {
            IQueryable<Project> query = _projectRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(p =>
                    p.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    p.Code.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            if (form.Id.HasValue)
                query = query.Where(e => e.Id == form.Id.Value);

            if (!string.IsNullOrWhiteSpace(form.Code))
                query = query.Where(e => e.Code.ToLower().Contains(form.Code.Trim().ToLower()));

            if (!string.IsNullOrWhiteSpace(form.Title))
                query = query.Where(e => e.Title.ToLower().Contains(form.Title.Trim().ToLower()));

            if (form.PlannedStartDate.HasValue)
                query = query.Where(e => e.PlannedStartDate == form.PlannedStartDate);
            if (form.PlannedStartDateMin.HasValue)
                query = query.Where(e => e.PlannedStartDate >= form.PlannedStartDateMin);
            if (form.PlannedStartDateMax.HasValue)
                query = query.Where(e => e.PlannedStartDate <= form.PlannedStartDateMax);

            if (form.PlannedDeadline.HasValue)
                query = query.Where(e => e.PlannedDeadline == form.PlannedDeadline);
            if (form.PlannedDeadlineMin.HasValue)
                query = query.Where(e => e.PlannedDeadline >= form.PlannedDeadlineMin);
            if (form.PlannedDeadlineMax.HasValue)
                query = query.Where(e => e.PlannedDeadline <= form.PlannedDeadlineMax);

            if (form.PlannedHours.HasValue)
                query = query.Where(e => e.PlannedHours == form.PlannedHours);
            if (form.PlannedHoursMin.HasValue)
                query = query.Where(e => e.PlannedHours >= form.PlannedHoursMin);
            if (form.PlannedHoursMax.HasValue)
                query = query.Where(e => e.PlannedHours <= form.PlannedHoursMax);

            if (form.ActualHours.HasValue)
                query = query.Where(e => e.ActualHours == form.ActualHours);
            if (form.ActualHoursMin.HasValue)
                query = query.Where(e => e.ActualHours >= form.ActualHoursMin);
            if (form.ActualHoursMax.HasValue)
                query = query.Where(e => e.ActualHours <= form.ActualHoursMax);

            if (form.StartedAt.HasValue)
                query = query.Where(e => e.StartedAt == form.StartedAt);

            if (form.EndAt.HasValue)
                query = query.Where(e => e.EndAt == form.EndAt);

            if (form.Status.HasValue)
                query = query.Where(e => e.Status == form.Status);

            if (form.Priority.HasValue)
                query = query.Where(e => e.Priority == form.Priority);

            if (form.ParentProjectId.HasValue)
                query = query.Where(e => e.ParentRelations.Any(pr => pr.ParentProjectId == form.ParentProjectId));

            if (form.ClientId.HasValue)
                query = query.Where(e => e.ClientId == form.ClientId);

            if (!string.IsNullOrWhiteSpace(form.LabelIds))
            {
                var labelIds = form.LabelIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Where(x => int.TryParse(x.Trim(), out _))
                                          .Select(x => int.Parse(x.Trim()))
                                          .ToList();

                if (labelIds.Any())
                {
                    query = query.Where(e => e.ProjectLabels.Any(pl => labelIds.Contains(pl.LabelId)));
                }
            }

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var projects = await query
                .Include(p => p.ParentRelations)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ProjectDto>
            {
                Data = ProjectMapper.Map(projects),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ProjectDto> GetProjectAsync(int projectId)
        {
            var project = await _projectRepository.Query(p => p.Id == projectId)
                .Include(p => p.ParentRelations)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .FirstOrDefaultAsync();

            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            return ProjectMapper.Map(project);
        }

        public async Task<DetailedProjectDto> GetDetailedProjectAsync(int projectId)
        {
            var project = await _projectRepository.Query(p => p.Id == projectId)
                .Include(p => p.ParentRelations)
                    .ThenInclude(pr => pr.ParentProject)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync();

            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            var detailedProjectDto = ProjectMapper.DetailedMap(project);

            if (project.ParentRelations != null && project.ParentRelations.Any())
            {
                detailedProjectDto.ParentProjects = project.ParentRelations
                    .Select(pr => ProjectMapper.Map(pr.ParentProject))
                    .ToList();
            }

            detailedProjectDto.Client = project.ClientId.HasValue
                ? ClientMapper.Map(await _clientRepository.GetByIdAsync(project.ClientId.Value))
                : null;

            if (project.Assignments != null && project.Assignments.Any())
            {
                detailedProjectDto.AssignedUsers = ProjectAssignmentMapper.MapWithUser(project.Assignments.ToList());
            }

            var createdBy = await _userRepository.GetByIdAsync(project.CreatedById);
            detailedProjectDto.CreatedByUser = createdBy != null ? IdNameMapper.Map(createdBy.Id, createdBy.Name) : null;

            if (project.UpdatedById.HasValue)
            {
                var updatedBy = await _userRepository.GetByIdAsync(project.UpdatedById);
                detailedProjectDto.UpdatedByUser = updatedBy != null ? IdNameMapper.Map(updatedBy.Id, updatedBy.Name) : null;
            }

            return detailedProjectDto;
        }

        public async Task DeleteProjectAsync(int projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId);
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            var childRelations = await _projectRelationRepository.GetByParentProjectIdAsync(projectId);
            if (childRelations.Any())
                throw new BusinessException("Bu projenin alt projeleri bulunmaktadır. Önce alt projeleri silmelisiniz.");

            var parentRelations = await _projectRelationRepository.GetByChildProjectIdAsync(projectId);
            foreach (var relation in parentRelations)
            {
                _projectRelationRepository.Delete(relation);
            }
            await _projectRelationRepository.SaveChangesAsync();

            var projectLabels = await _projectLabelRepository.GetByProjectIdAsync(projectId);
            foreach (var projectLabel in projectLabels)
            {
                _projectLabelRepository.Delete(projectLabel);
            }
            await _projectLabelRepository.SaveChangesAsync();

            _projectRepository.Delete(project);
            await _projectRepository.SaveChangesAsync();
        }
    }
}
