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
        private readonly ITaskRepository _taskRepository;
        private readonly IActivityRepository _activityRepository;

        public ProjectService(IProjectRepository projectRepository,
            IProjectRelationRepository projectRelationRepository,
            IProjectLabelRepository projectLabelRepository,
            ILabelRepository labelRepository,
            IClientRepository clientRepository,
            ILogger<ProjectService> logger,
            IUserRepository userRepository,
            IProjectAssignmentRepository projectAssignmentRepository,
            ITaskRepository taskRepository,
            IActivityRepository activityRepository,
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
            _taskRepository = taskRepository;
            _activityRepository = activityRepository;
        }

        public async Task<ProjectDto> AddProjectAsync(CreateProjectForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateProjectForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            form.Code = form.Code?.Trim();
            form.Title = form.Title?.Trim();
            NameValidator.ValidateCode(form.Code);
            NameValidator.ValidateTitle(form.Title);

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
                if (form.StartedAt is not null && form.EndAt is not null)
                {
                    form.Status = EProjectStatus.Completed;
                }
                else if (form.PlannedStartDate != null && form.PlannedStartDate < DateOnly.FromDateTime(DateTime.UtcNow))
                {
                    form.Status = EProjectStatus.Active;
                }
                else
                {
                    form.Status = EProjectStatus.Planned;
                }
            }

            if (form.Status == EProjectStatus.Active && form.StartedAt == null)
            {
                form.StartedAt = DateOnly.FromDateTime(DateTime.UtcNow);
            }

            if (form.Status == EProjectStatus.Completed)
            {
                if (form.StartedAt == null || form.EndAt == null || form.PlannedStartDate == null || form.PlannedDeadline == null || form.PlannedHours == null)
                    throw new BusinessException("Tamamlanmış bir proje için başlangıç, bitiş, planlanan başlangıç, planlanan bitiş tarihleri ve planlanan çalışma saati zorunludur.");
            }

            if (form.ParentProjectIds != null && form.ParentProjectIds.Count != 0)
            {
                var foundProjectsCount = await _projectRepository.Query(p => form.ParentProjectIds.Contains(p.Id)).CountAsync();
                if (foundProjectsCount != form.ParentProjectIds.Count)
                {
                    throw new NotFoundException("Gönderilen ebeveyn proje ID'lerinden bazıları sistemde bulunamadı.");
                }
            }

            if (form.ClientId is not null)
                _ = await _clientRepository.GetByIdAsync(form.ClientId) ?? throw new NotFoundException("Müşteri Bulunamadı!");

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                var foundLabelsCount = await _labelRepository.Query(l => form.LabelIds.Contains(l.Id)).CountAsync();
                if (foundLabelsCount != form.LabelIds.Count)
                {
                    throw new NotFoundException("Gönderilen etiket ID'lerinden bazıları sistemde bulunamadı.");
                }
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                var userIds = form.AssignedUsers.Select(au => au.UserId).ToList();
                var duplicateUserIds = userIds.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
                if (duplicateUserIds.Any())
                    throw new BusinessException($"Aynı kullanıcı birden fazla kez atanamaz. Tekrarlanan kullanıcı ID'leri: {string.Join(", ", duplicateUserIds)}");

                var foundUsersCount = await _userRepository.Query(u => userIds.Contains(u.Id)).CountAsync();
                if (foundUsersCount != userIds.Count)
                {
                    throw new NotFoundException("Atanan kullanıcılardan bazıları sistemde bulunamadı.");
                }

                foreach (var assignedUser in form.AssignedUsers)
                {
                    if (assignedUser.EndAt is not null && assignedUser.StartedAt is not null)
                    {
                        if (assignedUser.EndAt < assignedUser.StartedAt)
                            throw new BusinessException($"Kullanıcı {assignedUser.UserId} için projeden ayrılma tarihi başlama tarihinden önce olamaz.");
                    }
                }
            }

            var project = ProjectMapper.Map(form);

            _projectRepository.Create(project);

            if (form.ParentProjectIds != null && form.ParentProjectIds.Count != 0)
            {
                foreach (var parentId in form.ParentProjectIds)
                {
                    var relation = new ProjectRelation
                    {
                        ParentProjectId = parentId,
                        ChildProject = project
                    };
                    _projectRelationRepository.Create(relation);
                }
            }

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                {
                    var projectLabel = new ProjectLabel
                    {
                        Project = project,
                        LabelId = labelId
                    };
                    _projectLabelRepository.Create(projectLabel);
                }
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                foreach (var assignedUser in form.AssignedUsers)
                {
                    var projectAssignment = new ProjectAssignment
                    {
                        Project = project,
                        UserId = assignedUser.UserId,
                        Role = assignedUser.Role,
                        StartedAt = assignedUser.StartedAt,
                        EndAt = assignedUser.EndAt,
                        ExpectedHours = assignedUser.ExpectedHours
                    };
                    _projectAssignmentRepository.Create(projectAssignment);
                }
            }

            await _projectRepository.SaveChangesAsync();

            // Update parent projects' PlannedHours if the new project has PlannedHours
            if (form.PlannedHours.HasValue && form.ParentProjectIds != null && form.ParentProjectIds.Any())
            {
                foreach (var parentId in form.ParentProjectIds)
                {
                    var parent = await _projectRepository.GetByIdAsync(parentId);
                    if (parent != null)
                    {
                        var childRelations = await _projectRelationRepository.GetByParentProjectIdAsync(parentId);
                        var otherChildrenCount = childRelations.Count(cr => cr.ChildProjectId != project.Id);
                        if (otherChildrenCount > 0)
                        {
                            parent.PlannedHours = (parent.PlannedHours ?? 0) + form.PlannedHours.Value;
                        }
                        else
                        {
                            parent.PlannedHours = form.PlannedHours.Value;
                        }
                        _projectRepository.Update(parent);
                    }
                }
                await _projectRepository.SaveChangesAsync();
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

            form.Title = form.Title?.Trim();
            NameValidator.ValidateTitle(form.Title);

            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new NotFoundException("Proje Bulunamadı!");

            if (form.ClientId is not null && project.ClientId.HasValue && form.ClientId != project.ClientId.Value)
                throw new BusinessException("Müşteri projeye atandıktan sonra değiştirilemez.");

            var oldStatus = project.Status;

            if (project.Status != form.Status && form.Status == EProjectStatus.Completed)
            {
                await ValidateProjectCompletionAsync(projectId);
            }

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
                var foundProjectsCount = await _projectRepository.Query(p => form.ParentProjectIds.Contains(p.Id)).CountAsync();
                if (foundProjectsCount != form.ParentProjectIds.Count)
                {
                    throw new NotFoundException("Gönderilen üst proje ID'lerinden bazıları sistemde bulunamadı.");
                }

                var childProjects = await _projectRelationRepository.GetByParentProjectIdAsync(projectId);
                var childProjectIds = childProjects.Select(c => c.ChildProjectId).ToHashSet();

                var currentParentRelations = await _projectRelationRepository.GetByChildProjectIdAsync(projectId);
                var currentParentIds = currentParentRelations.Select(pr => pr.ParentProjectId).ToHashSet();

                foreach (var parentId in form.ParentProjectIds)
                {
                    if (parentId == projectId)
                        throw new BusinessException("Bir proje kendi parent'ı olamaz!");

                    if (childProjectIds.Contains(parentId))
                        throw new BusinessException("Bir proje, kendi alt projelerinden birine üst proje olarak atanamaz.");

                    if (!currentParentIds.Contains(parentId))
                    {
                        var hasCircularDependency = await _projectRelationRepository.HasCircularDependencyAsync(projectId, parentId);
                        if (hasCircularDependency)
                            throw new BusinessException($"Proje {parentId} ile döngüsel bağımlılık oluşturulamaz!");
                    }
                }
            }

            if (form.ClientId is not null)
                _ = await _clientRepository.GetByIdAsync(form.ClientId) ?? throw new NotFoundException("Müşteri Bulunamadı!");

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                var foundLabelsCount = await _labelRepository.Query(l => form.LabelIds.Contains(l.Id)).CountAsync();
                if (foundLabelsCount != form.LabelIds.Count)
                {
                    throw new NotFoundException("Gönderilen etiket ID'lerinden bazıları sistemde bulunamadı.");
                }
            }

            if (form.AssignedUsers != null && form.AssignedUsers.Count != 0)
            {
                var userIds = form.AssignedUsers.Select(au => au.UserId).ToList();
                var duplicateUserIds = userIds.GroupBy(x => x).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
                if (duplicateUserIds.Any())
                    throw new BusinessException($"Aynı kullanıcı birden fazla kez atanamaz. Tekrarlanan kullanıcı ID'leri: {string.Join(", ", duplicateUserIds)}");

                var foundUsersCount = await _userRepository.Query(u => userIds.Contains(u.Id)).CountAsync();
                if (foundUsersCount != userIds.Count)
                {
                    throw new NotFoundException("Atanan kullanıcılardan bazıları sistemde bulunamadı.");
                }

                foreach (var assignedUser in form.AssignedUsers)
                {
                    if (assignedUser.EndAt is not null && assignedUser.StartedAt is not null)
                    {
                        if (assignedUser.EndAt < assignedUser.StartedAt)
                            throw new BusinessException($"Kullanıcı {assignedUser.UserId} için projeden ayrılma tarihi başlama tarihinden önce olamaz.");
                    }
                }
            }

            if (project.Status == EProjectStatus.Planned && form.Status == EProjectStatus.Active && form.StartedAt == null)
            {
                form.StartedAt = DateOnly.FromDateTime(DateTime.UtcNow);
            }

            project = ProjectMapper.Map(form, project);

            if (project.Status == EProjectStatus.Completed)
            {
                if (project.StartedAt == null || project.EndAt == null || project.PlannedStartDate == null || project.PlannedDeadline == null || project.PlannedHours == null)
                    throw new BusinessException("Tamamlanmış bir proje için başlangıç, bitiş, planlanan başlangıç, planlanan bitiş tarihleri ve planlanan çalışma saati zorunludür.");
            }

            _projectRepository.Update(project);
            await _projectRepository.SaveChangesAsync();

            if (oldStatus != project.Status && project.Status == EProjectStatus.Inactive)
            {
                var tasks = await _taskRepository.GetByProjectIdAsync(projectId);
                foreach (var task in tasks)
                {
                    task.Status = ETaskStatus.Inactive;
                }
                await _taskRepository.SaveChangesAsync();
            }

            // Handle parent relations sync
            var existingParentRelations = await _projectRelationRepository.GetByChildProjectIdAsync(projectId);
            var existingParentIds = existingParentRelations.Select(pr => pr.ParentProjectId).ToHashSet();
            HashSet<int> desiredParentIds = form.ParentProjectIds?.ToHashSet() ?? new HashSet<int>();
            var parentsToAdd = desiredParentIds.Except(existingParentIds);
            var parentsToRemove = existingParentRelations.Where(pr => !desiredParentIds.Contains(pr.ParentProjectId));
            foreach (var relation in parentsToRemove)
            {
                _projectRelationRepository.Delete(relation);
            }
            foreach (var parentId in parentsToAdd)
            {
                var relation = new ProjectRelation
                {
                    ParentProjectId = parentId,
                    ChildProjectId = project.Id
                };
                _projectRelationRepository.Create(relation);
            }
            if (parentsToAdd.Any() || parentsToRemove.Any())
            {
                await _projectRelationRepository.SaveChangesAsync();
            }

            if (form.LabelIds != null)
            {
                var currentLabels = await _projectLabelRepository.GetByProjectIdAsync(projectId);
                var currentLabelIds = currentLabels.Select(pl => pl.LabelId).ToHashSet();
                var newLabelIds = form.LabelIds.ToHashSet();

                var labelsToAdd = newLabelIds.Except(currentLabelIds);
                foreach (var labelId in labelsToAdd)
                {
                    var projectLabel = new ProjectLabel
                    {
                        ProjectId = project.Id,
                        LabelId = labelId
                    };
                    _projectLabelRepository.Create(projectLabel);
                }

                var labelsToRemove = currentLabels.Where(pl => !newLabelIds.Contains(pl.LabelId));
                foreach (var pl in labelsToRemove)
                {
                    _projectLabelRepository.Delete(pl);
                }

                if (labelsToAdd.Any() || labelsToRemove.Any())
                {
                    await _projectLabelRepository.SaveChangesAsync();
                }
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
                            ExpectedHours = assignedUser.ExpectedHours
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
                query = query.Where(e => e.ParentRelations != null && e.ParentRelations.Any(pr => pr.ParentProjectId == form.ParentProjectId));

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
            var project = await _projectRepository.GetWithDetailsAsync(projectId);

            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            var detailedProjectDto = ProjectMapper.DetailedMap(project);

            if (project.ParentRelations != null && project.ParentRelations.Any())
            {
                detailedProjectDto.ParentProjects = project.ParentRelations
                    .Select(pr => ProjectMapper.Map(pr.ParentProject))
                    .ToList();
            }

            // Fetch child projects
            var childRelations = await _projectRelationRepository.GetByParentProjectIdAsync(projectId);
            if (childRelations.Any())
            {
                detailedProjectDto.ChildProjects = childRelations
                    .Select(cr => ProjectMapper.Map(cr.ChildProject))
                    .ToList();

                var childStatuses = childRelations.Select(cr => cr.ChildProject.Status).ToList();
                detailedProjectDto.ChildProjectsActiveCount = childStatuses.Count(s => s == EProjectStatus.Active);
                detailedProjectDto.ChildProjectsPlannedCount = childStatuses.Count(s => s == EProjectStatus.Planned);
                detailedProjectDto.ChildProjectsInactiveCount = childStatuses.Count(s => s == EProjectStatus.Inactive);
                detailedProjectDto.ChildProjectsWaitingForApprovalCount = childStatuses.Count(s => s == EProjectStatus.WaitingForApproval);
                detailedProjectDto.ChildProjectsCompletedCount = childStatuses.Count(s => s == EProjectStatus.Completed);
            }

            // Fetch tasks
            var allTasks = await _taskRepository.GetByProjectIdAsync(projectId);
            var taskDtos = TaskMapper.Map(allTasks);

            // Build hierarchy: top-level tasks and their subtasks
            var topLevelTasks = taskDtos.Where(t => t.ParentTaskId == null).ToList();
            foreach (var task in topLevelTasks)
            {
                task.SubTasks = taskDtos.Where(t => t.ParentTaskId == task.Id).ToList();
            }

            detailedProjectDto.Tasks = topLevelTasks;

            detailedProjectDto.TotalTaskCount = allTasks.Count;
            detailedProjectDto.DoneTaskCount = allTasks.Count(t => t.Status == ETaskStatus.Done);
            detailedProjectDto.LateTaskCount = allTasks.Count(t => t.PlannedEndDate.HasValue && t.PlannedEndDate.Value < DateOnly.FromDateTime(DateTime.UtcNow) && t.Status != ETaskStatus.Done);
            detailedProjectDto.TodoTaskCount = allTasks.Count(t => t.Status == ETaskStatus.Todo);
            detailedProjectDto.InProgressTaskCount = allTasks.Count(t => t.Status == ETaskStatus.InProgress);
            detailedProjectDto.InactiveTaskCount = allTasks.Count(t => t.Status == ETaskStatus.Inactive);
            detailedProjectDto.WaitingForApprovalTaskCount = allTasks.Count(t => t.Status == ETaskStatus.WaitingForApproval);

            // Calculate Burn-up Chart
            var taskIds = allTasks.Select(t => t.Id).ToList();
            var activities = await _activityRepository.Query(a => taskIds.Contains(a.TaskId)).ToListAsync();

            var finalTotalScope = allTasks.Sum(t => t.PlannedHours ?? 0);

            DateOnly startDateOnly;
            if (allTasks.Any())
            {
                startDateOnly = DateOnly.FromDateTime(allTasks.Min(t => t.CreatedAt).Date);
            }
            else
            {
                startDateOnly = DateOnly.FromDateTime(DateTime.UtcNow);
            }
            var endDateOnly = project.PlannedDeadline ?? DateOnly.FromDateTime(DateTime.UtcNow);

            var totalDays = (endDateOnly.ToDateTime(TimeOnly.MinValue) - startDateOnly.ToDateTime(TimeOnly.MinValue)).Days + 1;
            var dailyRate = totalDays > 0 ? finalTotalScope / totalDays : 0;

            var burnUpData = new List<BurnUpDataPointDto>();
            for (var date = startDateOnly; date <= endDateOnly; date = date.AddDays(1))
            {
                var currentScope = allTasks.Where(t => t.CreatedAt.Date <= date.ToDateTime(TimeOnly.MinValue)).Sum(t => t.PlannedHours ?? 0);
                var completedWork = activities.Where(a => a.StartTime.Date <= date.ToDateTime(TimeOnly.MinValue)).Sum(a => a.TotalHours);
                var dayIndex = (date.ToDateTime(TimeOnly.MinValue) - startDateOnly.ToDateTime(TimeOnly.MinValue)).Days + 1;
                var idealTrend = dailyRate * dayIndex;

                burnUpData.Add(new BurnUpDataPointDto
                {
                    Date = date,
                    TotalScope = currentScope,
                    CompletedWork = completedWork,
                    IdealTrend = idealTrend
                });
            }

            detailedProjectDto.BurnUpChart = burnUpData;

            detailedProjectDto.Client = project.Client != null ? ClientMapper.Map(project.Client) : null;

            if (project.Assignments != null && project.Assignments.Any())
            {
                detailedProjectDto.AssignedUsers = ProjectAssignmentMapper.MapWithUser(project.Assignments.ToList());
            }

            detailedProjectDto.CreatedByUser = project.CreatedByUser != null ? IdNameMapper.Map(project.CreatedByUser.Id, project.CreatedByUser.Name) : null;

            if (project.UpdatedByUser != null)
            {
                detailedProjectDto.UpdatedByUser = IdNameMapper.Map(project.UpdatedByUser.Id, project.UpdatedByUser.Name);
            }

            return detailedProjectDto;
        }

        public async Task<DetailedProjectDto> GetDetailedProjectByCodeAsync(string code)
        {
            var project = await _projectRepository.GetByCodeAsync(code.ToLower());
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");

            return await GetDetailedProjectAsync(project.Id);
        }

        public async Task<FullProjectHierarchyDto> GetFullProjectHierarchyAsync(int projectId)
        {
            // Get all related project IDs
            var relatedProjectIds = await _projectRelationRepository.GetAllRelatedProjectIdsAsync(projectId);

            // Fetch all related projects with includes
            var projects = await _projectRepository.Query(p => relatedProjectIds.Contains(p.Id))
                .Include(p => p.ParentRelations)
                    .ThenInclude(pr => pr.ParentProject)
                .Include(p => p.ChildRelations)
                    .ThenInclude(cr => cr.ChildProject)
                .Include(p => p.ProjectLabels)
                    .ThenInclude(pl => pl.Label)
                .Include(p => p.Assignments)
                    .ThenInclude(a => a.User)
                .Include(p => p.Client)
                .Include(p => p.CreatedByUser)
                .Include(p => p.UpdatedByUser)
                .ToListAsync();

            // Fetch all tasks for related projects
            var allTasks = await _taskRepository.Query(t => relatedProjectIds.Contains(t.ProjectId))
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments)
                    .ThenInclude(ta => ta.User)
                .ToListAsync();

            // Create a dictionary for project objects
            var projectObjects = new Dictionary<int, object>();
            var referencedProjects = new HashSet<int>();

            // Function to get project object
            async Task<object> GetProjectObject(int id)
            {
                if (projectObjects.ContainsKey(id))
                {
                    var proj = projects.First(p => p.Id == id);
                    return new IdNameCodeDto { Id = proj.Id, Name = proj.Title, Code = proj.Code };
                }
                else
                {
                    // Create full DTO
                    var proj = projects.First(p => p.Id == id);
                    var dto = ProjectMapper.MapToFullHierarchy(proj);
                    projectObjects[id] = dto;
                    referencedProjects.Add(id);

                    // Set client, assigned users, etc.
                    dto.Client = proj.Client != null ? ClientMapper.Map(await _clientRepository.GetByIdAsync(proj.ClientId.Value)) : null;

                    if (proj.Assignments != null && proj.Assignments.Any())
                    {
                        dto.AssignedUsers = ProjectAssignmentMapper.MapWithUser(proj.Assignments.ToList());
                    }

                    dto.CreatedByUser = proj.CreatedByUser != null ? IdNameMapper.Map(proj.CreatedByUser.Id, proj.CreatedByUser.Name) : null;

                    if (proj.UpdatedByUser != null)
                    {
                        dto.UpdatedByUser = IdNameMapper.Map(proj.UpdatedByUser.Id, proj.UpdatedByUser.Name);
                    }

                    return dto;
                }
            }

            // Start with the root
            var rootDto = (FullProjectHierarchyDto)await GetProjectObject(projectId);

            // Set parents (always flat)
            var rootProject = projects.First(p => p.Id == projectId);
            if (rootProject.ParentRelations != null && rootProject.ParentRelations.Any())
            {
                rootDto.ParentProjects = rootProject.ParentRelations
                    .Where(pr => relatedProjectIds.Contains(pr.ParentProjectId))
                    .Select(pr => (object)ProjectMapper.Map(pr.ParentProject))
                    .ToList();
            }

            // Set children recursively
            async Task SetChildren(FullProjectHierarchyDto dto, Project project)
            {
                if (project.ChildRelations != null && project.ChildRelations.Any())
                {
                    dto.ChildProjects = new List<object>();
                    foreach (var cr in project.ChildRelations.Where(cr => relatedProjectIds.Contains(cr.ChildProjectId) && cr.ChildProjectId != projectId))
                    {
                        dto.ChildProjects.Add(await GetProjectObject(cr.ChildProjectId));
                    }

                    // For full DTOs, set their children
                    foreach (var childObj in dto.ChildProjects)
                    {
                        if (childObj is FullProjectHierarchyDto childDto)
                        {
                            var childProject = projects.First(p => p.Id == childDto.Id);
                            await SetChildren(childDto, childProject);
                        }
                    }
                }
            }

            await SetChildren(rootDto, rootProject);

            // Set tasks for all full DTOs
            foreach (var obj in projectObjects.Values)
            {
                if (obj is FullProjectHierarchyDto dto)
                {
                    var proj = projects.First(p => p.Id == dto.Id);
                    var projectTasks = allTasks.Where(t => t.ProjectId == proj.Id).ToList();
                    var taskDtos = TaskMapper.Map(projectTasks);

                    // Build task hierarchy
                    var topLevelTasks = taskDtos.Where(t => t.ParentTaskId == null).ToList();
                    foreach (var task in topLevelTasks)
                    {
                        task.SubTasks = taskDtos.Where(t => t.ParentTaskId == task.Id).ToList();
                    }
                    dto.Tasks = topLevelTasks;
                }
            }

            return rootDto;
        }

        public async Task<List<FullProjectHierarchyDto>> QueryWithHierarchy(QueryProjectForm form)
        {
            IQueryable<Project> query = _projectRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(p =>
                    p.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    p.Code.ToLower().Contains(form.Search.Trim().ToLower()));
            }
            if (form.Id.HasValue) query = query.Where(e => e.Id == form.Id.Value);
            if (!string.IsNullOrWhiteSpace(form.Code)) query = query.Where(e => e.Code.ToLower().Contains(form.Code.Trim().ToLower()));
            if (!string.IsNullOrWhiteSpace(form.Title)) query = query.Where(e => e.Title.ToLower().Contains(form.Title.Trim().ToLower()));
            if (form.PlannedStartDate.HasValue) query = query.Where(e => e.PlannedStartDate == form.PlannedStartDate);
            if (form.PlannedStartDateMin.HasValue) query = query.Where(e => e.PlannedStartDate >= form.PlannedStartDateMin);
            if (form.PlannedStartDateMax.HasValue) query = query.Where(e => e.PlannedStartDate <= form.PlannedStartDateMax);
            if (form.PlannedDeadline.HasValue) query = query.Where(e => e.PlannedDeadline == form.PlannedDeadline);
            if (form.PlannedDeadlineMin.HasValue) query = query.Where(e => e.PlannedDeadline >= form.PlannedDeadlineMin);
            if (form.PlannedDeadlineMax.HasValue) query = query.Where(e => e.PlannedDeadline <= form.PlannedDeadlineMax);
            if (form.PlannedHours.HasValue) query = query.Where(e => e.PlannedHours == form.PlannedHours);
            if (form.PlannedHoursMin.HasValue) query = query.Where(e => e.PlannedHours >= form.PlannedHoursMin);
            if (form.PlannedHoursMax.HasValue) query = query.Where(e => e.PlannedHours <= form.PlannedHoursMax);
            if (form.ActualHours.HasValue) query = query.Where(e => e.ActualHours == form.ActualHours);
            if (form.ActualHoursMin.HasValue) query = query.Where(e => e.ActualHours >= form.ActualHoursMin);
            if (form.ActualHoursMax.HasValue) query = query.Where(e => e.ActualHours <= form.ActualHoursMax);
            if (form.StartedAt.HasValue) query = query.Where(e => e.StartedAt == form.StartedAt);
            if (form.EndAt.HasValue) query = query.Where(e => e.EndAt == form.EndAt);
            if (form.Status.HasValue) query = query.Where(e => e.Status == form.Status);
            if (form.Priority.HasValue) query = query.Where(e => e.Priority == form.Priority);
            if (form.ParentProjectId.HasValue) query = query.Where(e => e.ParentRelations.Any(pr => pr.ParentProjectId == form.ParentProjectId));
            if (form.ClientId.HasValue) query = query.Where(e => e.ClientId == form.ClientId);
            if (!string.IsNullOrWhiteSpace(form.LabelIds))
            {
                var labelIds = form.LabelIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                            .Where(x => int.TryParse(x.Trim(), out _))
                                            .Select(x => int.Parse(x.Trim()))
                                            .ToList();
                if (labelIds.Any()) query = query.Where(e => e.ProjectLabels.Any(pl => labelIds.Contains(pl.LabelId)));
            }

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);


            var projects = await query
                .Include(p => p.ParentRelations)
                .Include(p => p.ProjectLabels).ThenInclude(pl => pl.Label)
                .ToListAsync();

            var projectIds = projects.Select(p => p.Id).ToHashSet();

            var topLevelProjects = projects.Where(p => !p.ParentRelations.Any(pr => projectIds.Contains(pr.ParentProjectId))).ToList();
            if (projects.Any() && !topLevelProjects.Any()) topLevelProjects = projects;

            var topLevelProjectIds = topLevelProjects.Select(p => p.Id).ToList();

            var allRelatedIds = new HashSet<int>(topLevelProjectIds);
            foreach (var id in topLevelProjectIds)
            {
                var related = await _projectRelationRepository.GetAllRelatedProjectIdsAsync(id);
                allRelatedIds.UnionWith(related);
            }

            var allProjects = await _projectRepository.Query(p => allRelatedIds.Contains(p.Id))
                .Include(p => p.ParentRelations).ThenInclude(pr => pr.ParentProject)
                .Include(p => p.ChildRelations).ThenInclude(cr => cr.ChildProject)
                .Include(p => p.ProjectLabels).ThenInclude(pl => pl.Label)
                .Include(p => p.Assignments).ThenInclude(a => a.User)
                .ToListAsync();

            allRelatedIds = allProjects.Select(p => p.Id).ToHashSet();

            var allTasks = await _taskRepository.Query(t => allRelatedIds.Contains(t.ProjectId))
                .Include(t => t.Project)
                .Include(t => t.TaskLabels).ThenInclude(tl => tl.Label)
                .Include(t => t.TaskAssignments).ThenInclude(ta => ta.User)
                .ToListAsync();

            var result = new List<FullProjectHierarchyDto>();

            foreach (var proj in topLevelProjects)
            {
                var projectObjects = new Dictionary<int, object>();
                var referencedProjects = new HashSet<int>();

                async Task<object?> GetProjectObject(int id)
                {
                    var p = allProjects.FirstOrDefault(p => p.Id == id);
                    if (p == null) return null;

                    if (projectObjects.ContainsKey(id))
                    {
                        return new IdNameCodeDto { Id = p.Id, Name = p.Title, Code = p.Code };
                    }
                    else
                    {
                        var dto = ProjectMapper.MapToFullHierarchy(p);
                        projectObjects[id] = dto;
                        referencedProjects.Add(id);


                        if (p.ClientId.HasValue)
                        {
                            var client = await _clientRepository.GetByIdAsync(p.ClientId.Value);
                            dto.Client = client != null ? ClientMapper.Map(client) : null;
                        }

                        if (p.Assignments != null && p.Assignments.Any())
                        {
                            dto.AssignedUsers = ProjectAssignmentMapper.MapWithUser(p.Assignments.ToList());
                        }

                        var createdBy = await _userRepository.GetByIdAsync(p.CreatedById);
                        dto.CreatedByUser = createdBy != null ? IdNameMapper.Map(createdBy.Id, createdBy.Name) : null;

                        if (p.UpdatedById.HasValue)
                        {
                            var updatedBy = await _userRepository.GetByIdAsync(p.UpdatedById.Value);
                            dto.UpdatedByUser = updatedBy != null ? IdNameMapper.Map(updatedBy.Id, updatedBy.Name) : null;
                        }

                        return dto;
                    }
                }

                var rootObject = await GetProjectObject(proj.Id);
                if (rootObject == null) continue;

                var rootDto = (FullProjectHierarchyDto)rootObject;

                if (proj.ParentRelations != null && proj.ParentRelations.Any())
                {
                    rootDto.ParentProjects = proj.ParentRelations
                        .Where(pr => allRelatedIds.Contains(pr.ParentProjectId))
                        .Select(pr => (object)ProjectMapper.Map(pr.ParentProject))
                        .ToList();
                }

                async Task SetChildren(FullProjectHierarchyDto dto, Project project)
                {
                    if (project.ChildRelations != null && project.ChildRelations.Any())
                    {
                        dto.ChildProjects = new List<object>();
                        foreach (var cr in project.ChildRelations.Where(cr => allRelatedIds.Contains(cr.ChildProjectId)))
                        {
                            var childObj = await GetProjectObject(cr.ChildProjectId);
                            if (childObj != null) dto.ChildProjects.Add(childObj);
                        }

                        foreach (var childObj in dto.ChildProjects)
                        {
                            if (childObj is FullProjectHierarchyDto childDto)
                            {
                                var childProject = allProjects.FirstOrDefault(p => p.Id == childDto.Id);
                                if (childProject != null) await SetChildren(childDto, childProject);
                            }
                        }
                    }
                }

                await SetChildren(rootDto, proj);

                foreach (var obj in projectObjects.Values)
                {
                    if (obj is FullProjectHierarchyDto dto)
                    {
                        var p = allProjects.FirstOrDefault(p => p.Id == dto.Id);
                        if (p == null) continue;

                        var projectTasks = allTasks.Where(t => t.ProjectId == p.Id).ToList();
                        var taskDtos = TaskMapper.Map(projectTasks);
                        var topLevelTasks = taskDtos.Where(t => t.ParentTaskId == null).ToList();
                        foreach (var task in topLevelTasks)
                        {
                            task.SubTasks = taskDtos.Where(t => t.ParentTaskId == task.Id).ToList();
                        }
                        dto.Tasks = topLevelTasks;
                    }
                }
                result.Add(rootDto);
            }

            return result;
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

        #region Helper Methods

        private async Task ValidateProjectCompletionAsync(int projectId)
        {
            var incompleteItems = new List<string>();

            var childRelations = await _projectRelationRepository.GetByParentProjectIdAsync(projectId);
            foreach (var relation in childRelations)
            {
                var childProject = await _projectRepository.GetByIdAsync(relation.ChildProjectId);
                if (childProject != null && childProject.Status != EProjectStatus.Completed && childProject.Status != EProjectStatus.Inactive)
                {
                    incompleteItems.Add($"Alt Proje: '{childProject.Title}' (Kod: {childProject.Code}) - Durum: {GetProjectStatusText(childProject.Status)}");
                }
            }

            var projectTasks = await _taskRepository.GetByProjectIdAsync(projectId);
            foreach (var task in projectTasks)
            {
                if (task.Status != ETaskStatus.Done && task.Status != ETaskStatus.Inactive)
                {
                    incompleteItems.Add($"Görev: '{task.Title}' (Kod: {task.Code}) - Durum: {GetTaskStatusText(task.Status)}");
                }
            }

            if (incompleteItems.Any())
            {
                var errorMessage = "Proje tamamlanamaz çünkü aşağıdaki alt projeler ve görevler henüz tamamlanmamış veya iptal edilmemiş:\n" +
                                   string.Join("\n", incompleteItems);
                throw new BusinessException(errorMessage);
            }
        }

        private static string GetProjectStatusText(EProjectStatus status)
        {
            return status switch
            {
                EProjectStatus.Active => "Aktif",
                EProjectStatus.Inactive => "Pasif",
                EProjectStatus.Completed => "Tamamlandı",
                EProjectStatus.Planned => "Planlandı",
                EProjectStatus.WaitingForApproval => "Onay Bekliyor",
                _ => status.ToString()
            };
        }

        private static string GetTaskStatusText(ETaskStatus status)
        {
            return status switch
            {
                ETaskStatus.Todo => "Yapılacak",
                ETaskStatus.InProgress => "Devam Ediyor",
                ETaskStatus.Done => "Tamamlandı",
                ETaskStatus.Inactive => "Pasif",
                ETaskStatus.WaitingForApproval => "Onay Bekliyor",
                _ => status.ToString()
            };
        }

        #endregion

        public async Task<FullProjectHierarchyDto> GetFullProjectHierarchyByCodeAsync(string code)
        {
            var project = await _projectRepository.GetByCodeAsync(code.ToLower());
            if (project == null)
                throw new NotFoundException("Proje Bulunamadı!");
            return await GetFullProjectHierarchyAsync(project.Id);
        }
    }
}
