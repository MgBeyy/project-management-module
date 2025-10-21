using Microsoft.Extensions.Logging;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Entities;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class TaskDependencyService : _BaseService, ITaskDependencyService
    {
        private readonly ITaskDependencyRepository _taskDependencyRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly ILogger<TaskDependencyService> _logger;

        public TaskDependencyService(
            ITaskDependencyRepository taskDependencyRepository,
            ITaskRepository taskRepository,
            ILogger<TaskDependencyService> logger,
            IUserRepository userRepository,
            IPrincipal principal)
            : base(principal, logger, userRepository)
        {
            _taskDependencyRepository = taskDependencyRepository;
            _taskRepository = taskRepository;
            _logger = logger;
        }

        public async Task<TaskDependencyDto> CreateDependencyAsync(CreateTaskDependencyForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateTaskDependencyForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            if (form.BlockingTaskId == form.BlockedTaskId)
                throw new BusinessException("Görev kendisini bloklayamaz!");

            var blockingTask = await _taskRepository.GetByIdAsync(form.BlockingTaskId)
                ?? throw new NotFoundException("Bloklayan görev bulunamadı!");

            var blockedTask = await _taskRepository.GetByIdAsync(form.BlockedTaskId)
                ?? throw new NotFoundException("Bloklanan görev bulunamadı!");

            var existingDependency = await _taskDependencyRepository.GetByTaskIdsAsync(form.BlockingTaskId, form.BlockedTaskId);
            if (existingDependency != null)
                throw new BusinessException("Bu görevler arasında zaten bir bağımlılık mevcut!");

            var hasCircularDependency = await _taskDependencyRepository.HasCircularDependencyAsync(form.BlockedTaskId, form.BlockingTaskId);
            if (hasCircularDependency)
                throw new BusinessException("Döngüsel bağımlılık oluşturulamaz!");

            var dependency = TaskDependencyMapper.Map(form);
            dependency.CreatedAt = DateTime.UtcNow;
            dependency.CreatedById = LoggedInUser.Id;

            _taskDependencyRepository.Create(dependency);
            await _taskDependencyRepository.SaveChangesAsync();

            var createdDependency = await _taskDependencyRepository.GetByIdWithTasksAsync(dependency.Id);
            return TaskDependencyMapper.Map(createdDependency);
        }

        public async Task<TaskDependenciesDto> GetTaskDependenciesAsync(int taskId)
        {
            var task = await _taskRepository.GetWithDependenciesAsync(taskId);
            if (task == null)
                throw new NotFoundException("Görev bulunamadı!");

            return TaskDependencyMapper.Map(task);
        }

        public async Task<TaskDependenciesDto> ManageTaskDependenciesAsync(ManageTaskDependenciesForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(ManageTaskDependenciesForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var task = await _taskRepository.GetByIdAsync(form.TaskId)
                ?? throw new NotFoundException("Görev bulunamadı!");

            if (form.BlockedTaskIds.Contains(form.TaskId))
                throw new BusinessException("Görev kendisini bloklayamaz!");

            foreach (var blockedTaskId in form.BlockedTaskIds)
            {
                var blockedTask = await _taskRepository.GetByIdAsync(blockedTaskId);
                if (blockedTask == null)
                    throw new NotFoundException($"ID {blockedTaskId} ile görev bulunamadı!");

                var hasCircularDependency = await _taskDependencyRepository.HasCircularDependencyAsync(blockedTaskId, form.TaskId);
                if (hasCircularDependency)
                    throw new BusinessException($"Görev {blockedTaskId} ile döngüsel bağımlılık oluşturulamaz!");
            }

            var existingDependencies = await _taskDependencyRepository.GetByBlockingTaskIdAsync(form.TaskId);
            foreach (var dependency in existingDependencies)
            {
                _taskDependencyRepository.Delete(dependency);
            }
            await _taskDependencyRepository.SaveChangesAsync();

            foreach (var blockedTaskId in form.BlockedTaskIds)
            {
                var dependency = new TaskDependency
                {
                    BlockingTaskId = form.TaskId,
                    BlockedTaskId = blockedTaskId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = LoggedInUser.Id
                };
                _taskDependencyRepository.Create(dependency);
            }

            if (form.BlockedTaskIds.Any())
            {
                await _taskDependencyRepository.SaveChangesAsync();
            }

            return await GetTaskDependenciesAsync(form.TaskId);
        }

        public async Task RemoveDependencyAsync(int blockingTaskId, int blockedTaskId)
        {
            var dependency = await _taskDependencyRepository.GetByTaskIdsAsync(blockingTaskId, blockedTaskId)
                ?? throw new NotFoundException("Bağımlılık bulunamadı!");

            _taskDependencyRepository.Delete(dependency);
            await _taskDependencyRepository.SaveChangesAsync();
        }

        public async Task RemoveDependencyByIdAsync(int dependencyId)
        {
            var dependency = await _taskDependencyRepository.GetByIdAsync(dependencyId)
                ?? throw new NotFoundException("Bağımlılık bulunamadı!");

            _taskDependencyRepository.Delete(dependency);
            await _taskDependencyRepository.SaveChangesAsync();
        }
    }
}