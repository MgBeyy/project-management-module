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
    public class TaskService : _BaseService, ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly ITaskLabelRepository _taskLabelRepository;
        private readonly ILabelRepository _labelRepository;
        private readonly ITaskDependencyRepository _taskDependencyRepository;
        private readonly ILogger<TaskService> _logger;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;

        public TaskService(
            ITaskRepository taskRepository,
            ITaskLabelRepository taskLabelRepository,
            ILabelRepository labelRepository,
            ITaskDependencyRepository taskDependencyRepository,
            ILogger<TaskService> logger,
            IUserRepository userRepository,
            IProjectRepository projectRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _taskRepository = taskRepository;
            _taskLabelRepository = taskLabelRepository;
            _labelRepository = labelRepository;
            _taskDependencyRepository = taskDependencyRepository;
            _logger = logger;
            _userRepository = userRepository;
            _projectRepository = projectRepository;
        }

        public async Task<TaskDto> AddTaskAsync(CreateTaskForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateTaskForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            // Code benzersizlik kontrolü
            var existingTask = await _taskRepository.GetByCodeAsync(form.Code);
            if (existingTask is not null)
                throw new BusinessException("Bu kod ile kayıtlı bir görev bulunmaktadır.");

            _ = await _projectRepository.GetByIdAsync(form.ProjectId) ?? throw new NotFoundException("İlgili Proje Bulunamadı! Önce bir proje oluşturun");
            if (form.ParentTaskId.HasValue)
                _ = await _taskRepository.GetByIdAsync(form.ParentTaskId) ?? throw new NotFoundException("İlgili üst görev Bulunamadı!");

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                    _ = await _labelRepository.GetByIdAsync(labelId) ?? throw new NotFoundException($"ID {labelId} ile etiket bulunamadı!");
            }

            var task = TaskMapper.Map(form);
            task.CreatedAt = DateTime.UtcNow;
            task.CreatedById = LoggedInUser.Id;
            _taskRepository.Create(task);
            await _taskRepository.SaveChangesAsync();

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                {
                    var taskLabel = new TaskLabel
                    {
                        TaskId = task.Id,
                        LabelId = labelId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _taskLabelRepository.Create(taskLabel);
                }
                await _taskLabelRepository.SaveChangesAsync();
            }

            var createdTask = await _taskRepository.GetWithLabelsAsync(task.Id);
            return TaskMapper.Map(createdTask);
        }

        public async Task<TaskDto> GetTaskAsync(int taskId)
        {
            var task = await _taskRepository.GetWithLabelsAsync(taskId);
            if (task == null)
                throw new NotFoundException("Görev Bulunamadı!");

            return TaskMapper.Map(task);
        }

        public async Task<TaskDto> EditTaskAsync(int taskId, UpdateTaskForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateTaskForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new NotFoundException("Görev Bulunamadı!");

            // Status değişikliği validasyonu
            if (task.Status != form.Status)
            {
                await ValidateTaskStatusChangeAsync(taskId, form.Status);
            }

            if (form.LabelIds != null && form.LabelIds.Count != 0)
            {
                foreach (var labelId in form.LabelIds)
                    _ = await _labelRepository.GetByIdAsync(labelId) ?? throw new NotFoundException($"ID {labelId} ile etiket bulunamadı!");
            }

            task = TaskMapper.Map(form, task);
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = LoggedInUser.Id;
            _taskRepository.Update(task);
            await _taskRepository.SaveChangesAsync();

            var existingLabels = await _taskLabelRepository.GetByTaskIdAsync(taskId);
            foreach (var taskLabel in existingLabels)
            {
                _taskLabelRepository.Delete(taskLabel);
            }
            await _taskLabelRepository.SaveChangesAsync();

            if (form.LabelIds != null && form.LabelIds.Any())
            {
                foreach (var labelId in form.LabelIds)
                {
                    var taskLabel = new TaskLabel
                    {
                        TaskId = task.Id,
                        LabelId = labelId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = LoggedInUser.Id
                    };
                    _taskLabelRepository.Create(taskLabel);
                }
                await _taskLabelRepository.SaveChangesAsync();
            }

            var updatedTask = await _taskRepository.GetWithLabelsAsync(task.Id);
            return TaskMapper.Map(updatedTask);
        }

        public async Task<PagedResult<TaskDto>> Query(QueryTaskForm form)
        {
            IQueryable<TaskEntity> query = _taskRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(t =>
                    t.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    t.Code.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    (t.Description != null && t.Description.ToLower().Contains(form.Search.Trim().ToLower()))
                );
            }
            if (form.Id.HasValue)
                query = query.Where(t => t.Id == form.Id.Value);
            if (!string.IsNullOrWhiteSpace(form.Code))
                query = query.Where(t => t.Code.ToLower().Contains(form.Code.Trim().ToLower()));
            if (form.ProjectId.HasValue)
                query = query.Where(t => t.ProjectId == form.ProjectId.Value);
            if (form.ParentTaskId.HasValue)
                query = query.Where(t => t.ParentTaskId == form.ParentTaskId.Value);
            if (!string.IsNullOrWhiteSpace(form.Title))
                query = query.Where(t => t.Title.ToLower().Contains(form.Title.Trim().ToLower()));
            if (!string.IsNullOrWhiteSpace(form.Description))
                query = query.Where(t => t.Description != null && t.Description.ToLower().Contains(form.Description.Trim().ToLower()));
            if (form.Status.HasValue)
                query = query.Where(t => t.Status == form.Status);
            if (form.PlannedHours.HasValue)
                query = query.Where(t => t.PlannedHours == form.PlannedHours);
            if (form.PlannedHoursMin.HasValue)
                query = query.Where(t => t.PlannedHours >= form.PlannedHoursMin);
            if (form.PlannedHoursMax.HasValue)
                query = query.Where(t => t.PlannedHours <= form.PlannedHoursMax);
            if (form.ActualHours.HasValue)
                query = query.Where(t => t.ActualHours == form.ActualHours);
            if (form.ActualHoursMin.HasValue)
                query = query.Where(t => t.ActualHours >= form.ActualHoursMin);
            if (form.ActualHoursMax.HasValue)
                query = query.Where(t => t.ActualHours <= form.ActualHoursMax);
            if (form.CreatedAt.HasValue)
                query = query.Where(t => t.CreatedAt == form.CreatedAt);
            if (form.CreatedAtMin.HasValue)
                query = query.Where(t => t.CreatedAt >= form.CreatedAtMin);
            if (form.CreatedAtMax.HasValue)
                query = query.Where(t => t.CreatedAt <= form.CreatedAtMax);
            if (form.CreatedById.HasValue)
                query = query.Where(t => t.CreatedById == form.CreatedById);
            if (form.UpdatedAt.HasValue)
                query = query.Where(t => t.UpdatedAt == form.UpdatedAt);
            if (form.UpdatedAtMin.HasValue)
                query = query.Where(t => t.UpdatedAt >= form.UpdatedAtMin);
            if (form.UpdatedAtMax.HasValue)
                query = query.Where(t => t.UpdatedAt <= form.UpdatedAtMax);
            if (form.UpdatedById.HasValue)
                query = query.Where(t => t.UpdatedById == form.UpdatedById);

            if (!string.IsNullOrWhiteSpace(form.LabelIds))
            {
                var labelIds = form.LabelIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Where(x => int.TryParse(x.Trim(), out _))
                                          .Select(x => int.Parse(x.Trim()))
                                          .ToList();
                
                if (labelIds.Any())
                {
                    query = query.Where(t => t.TaskLabels.Any(tl => labelIds.Contains(tl.LabelId)));
                }
            }

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;
            int totalRecords = await query.CountAsync();

            var tasks = await query
                .Include(t => t.Project)
                .Include(t => t.TaskLabels)
                    .ThenInclude(tl => tl.Label)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<TaskDto>
            {
                Data = TaskMapper.Map(tasks),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<List<TaskDto>> GetSubTasksByTaskId(int taskId)
        {
            var subTasks = await _taskRepository.GetSubTasksWithLabelsAsync(taskId);
            return TaskMapper.Map(subTasks);
        }

        public async Task DeleteTaskAsync(int taskId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new NotFoundException("Görev Bulunamadı!");

            // Silme validasyonu - bağımlılık kontrolü
            await ValidateTaskDeletionAsync(taskId);

            _taskRepository.Delete(task);
            await _taskRepository.SaveChangesAsync();
        }

        public async Task<List<TaskDto>> BulkUpdateTaskStatusAsync(BulkUpdateTaskStatusForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(BulkUpdateTaskStatusForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            var tasks = new List<TaskEntity>();
            foreach (var taskId in form.TaskIds)
            {
                var task = await _taskRepository.GetByIdAsync(taskId);
                if (task == null)
                    throw new NotFoundException($"ID {taskId} ile görev bulunamadı!");

                tasks.Add(task);
            }

            // Dependency kontrolü (ignore edilmemişse)
            if (!form.IgnoreDependencyRules)
            {
                foreach (var task in tasks)
                {
                    if (task.Status != form.Status)
                    {
                        await ValidateTaskStatusChangeAsync(task.Id, form.Status);
                    }
                }
            }

            // Toplu güncelleme
            var updatedTasks = new List<TaskDto>();
            foreach (var task in tasks)
            {
                if (task.Status != form.Status)
                {
                    task.Status = form.Status;
                    task.UpdatedAt = DateTime.UtcNow;
                    task.UpdatedById = LoggedInUser.Id;
                    _taskRepository.Update(task);
                }
            }

            await _taskRepository.SaveChangesAsync();

            // Güncellenmiş task'ları döndür
            foreach (var task in tasks)
            {
                var updatedTask = await _taskRepository.GetWithLabelsAsync(task.Id);
                if (updatedTask != null)
                {
                    updatedTasks.Add(TaskMapper.Map(updatedTask));
                }
            }

            return updatedTasks;
        }

        #region Helper Methods

        private async Task ValidateTaskStatusChangeAsync(int taskId, ETaskStatus newStatus)
        {
            // Eğer task "Done" durumuna geçirilmeye çalışılıyorsa
            if (newStatus == ETaskStatus.Done)
            {
                // Bu task'ı bloke eden (bağımlı olduğu) task'ları kontrol et
                var blockingDependencies = await _taskDependencyRepository.GetByBlockedTaskIdAsync(taskId);
                var incompleteBlockingTasks = new List<string>();

                foreach (var dependency in blockingDependencies)
                {
                    var blockingTask = await _taskRepository.GetByIdAsync(dependency.BlockingTaskId);
                    if (blockingTask != null && blockingTask.Status != ETaskStatus.Done)
                    {
                        incompleteBlockingTasks.Add($"'{blockingTask.Title}' (ID: {blockingTask.Id})");
                    }
                }

                if (incompleteBlockingTasks.Any())
                {
                    throw new BusinessException(
                        $"Bu görev tamamlanamaz çünkü aşağıdaki bağımlı görevler henüz tamamlanmamış: {string.Join(", ", incompleteBlockingTasks)}"
                    );
                }
            }

            // Eğer task "Done" durumundan başka bir duruma geçirilmeye çalışılıyorsa
            var currentTask = await _taskRepository.GetByIdAsync(taskId);
            if (currentTask?.Status == ETaskStatus.Done && newStatus != ETaskStatus.Done)
            {
                // Bu task'ın bloke ettiği (bağımlısı olan) task'ları kontrol et
                var blockedDependencies = await _taskDependencyRepository.GetByBlockingTaskIdAsync(taskId);
                var completedBlockedTasks = new List<string>();

                foreach (var dependency in blockedDependencies)
                {
                    var blockedTask = await _taskRepository.GetByIdAsync(dependency.BlockedTaskId);
                    if (blockedTask != null && blockedTask.Status == ETaskStatus.Done)
                    {
                        completedBlockedTasks.Add($"'{blockedTask.Title}' (ID: {blockedTask.Id})");
                    }
                }

                if (completedBlockedTasks.Any())
                {
                    throw new BusinessException(
                        $"Bu görevin durumu değiştirilemez çünkü aşağıdaki bağımlı görevler zaten tamamlanmış: {string.Join(", ", completedBlockedTasks)}"
                    );
                }
            }
        }

        private async Task ValidateTaskDeletionAsync(int taskId)
        {
            // Task'ın bağımlılıklarını kontrol et
            var blockingDependencies = await _taskDependencyRepository.GetByBlockingTaskIdAsync(taskId);
            var blockedDependencies = await _taskDependencyRepository.GetByBlockedTaskIdAsync(taskId);

            if (blockingDependencies.Any() || blockedDependencies.Any())
            {
                var dependencyCount = blockingDependencies.Count + blockedDependencies.Count;
                throw new BusinessException(
                    $"Bu görev silinemez çünkü {dependencyCount} adet bağımlılık ilişkisi bulunmaktadır. " +
                    "Önce tüm bağımlılıkları kaldırın."
                );
            }
        }

        #endregion
    }
}
