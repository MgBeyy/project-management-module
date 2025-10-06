using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Entities;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface ITaskService
    {
        Task<TaskDto> AddTaskAsync(CreateTaskForm form);
        Task<TaskDto> GetTaskAsync(int taskId);
        Task<TaskDto> EditTaskAsync(int taskId, UpdateTaskForm form);
        Task<PagedResult<TaskDto>> Query(QueryTaskForm form);
    }

    public class TaskService : _BaseService, ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly ILogger<TaskService> _logger;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;
        public TaskService(ITaskRepository taskRepository,
            ILogger<TaskService> logger,
            IUserRepository userRepository,
            IProjectRepository projectRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _taskRepository = taskRepository;
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

            _ = await _projectRepository.GetByIdAsync(form.ProjectId) ?? throw new NotFoundException("Ýlgili Proje Bulunamadý! Önce bir proje oluþturun");
            if (form.ParentTaskId.HasValue)
                _ = await _taskRepository.GetByIdAsync(form.ParentTaskId) ?? throw new NotFoundException("Ýlgili Üst Task Bulunamadý!");

            var task = TaskMapper.Map(form);
            task.CreatedAt = DateTime.UtcNow;
            task.CreatedById = LoggedInUser.Id;
            _taskRepository.Create(task);
            await _taskRepository.SaveChangesAsync();
            return TaskMapper.Map(task);
        }

        public async Task<TaskDto> GetTaskAsync(int taskId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new NotFoundException("Task Bulunamadý!");
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
                throw new NotFoundException("Task Bulunamadý!");

            task = TaskMapper.Map(form, task);
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedById = LoggedInUser.Id;
            _taskRepository.Update(task);
            await _taskRepository.SaveChangesAsync();
            return TaskMapper.Map(task);
        }

        public async Task<PagedResult<TaskDto>> Query(QueryTaskForm form)
        {
            IQueryable<TaskEntity> query = _taskRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(t =>
                    t.Title.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    (t.Description != null && t.Description.ToLower().Contains(form.Search.Trim().ToLower()))
                );
            }
            if (form.Id.HasValue)
                query = query.Where(t => t.Id == form.Id.Value);
            if (form.ProjectId.HasValue)
                query = query.Where(t => t.ProjectId == form.ProjectId.Value);
            if (form.ParentTaskId.HasValue)
                query = query.Where(t => t.ParentTaskId == form.ParentTaskId.Value);
            if (!string.IsNullOrWhiteSpace(form.Title))
                query = query.Where(t => t.Title.ToLower().Contains(form.Title.Trim().ToLower()));
            if (!string.IsNullOrWhiteSpace(form.Description))
                query = query.Where(t => t.Description != null && t.Description.ToLower().Contains(form.Description.Trim().ToLower()));
            if (form.Weight.HasValue)
                query = query.Where(t => t.Weight == form.Weight);
            if (form.WeightMin.HasValue)
                query = query.Where(t => t.Weight >= form.WeightMin);
            if (form.WeightMax.HasValue)
                query = query.Where(t => t.Weight <= form.WeightMax);
            if (form.Status.HasValue)
                query = query.Where(t => t.Status == form.Status);
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

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;
            int totalRecords = await query.CountAsync();
            var tasks = await query
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
    }
}
