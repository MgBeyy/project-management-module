using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface ITaskService
    {
        Task<TaskDto> AddTaskAsync(CreateTaskForm form);
        Task<TaskDto> GetTaskAsync(int taskId);
        Task<List<TaskDto>> GetAllTasks();
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

            var task = TaskMapper.Map(form);
            task.CreatedAt = DateTime.UtcNow;
            task.CreatedById = LoggedInUser.Id;
            _taskRepository.Create(task);
            await _taskRepository.SaveChangesAsync();
            return TaskMapper.Map(task);
        }

        public async Task<List<TaskDto>> GetAllTasks()
        {
            var tasks = _taskRepository.QueryAll();
            return TaskMapper.Map(await tasks.ToListAsync());
        }

        public async Task<TaskDto> GetTaskAsync(int taskId)
        {
            var task = await _taskRepository.GetByIdAsync(taskId);
            if (task == null)
                throw new NotFoundException("Task Bulunamadý!");
            return TaskMapper.Map(task);
        }
    }
}
