using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Exceptions;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Interfaces.Services;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public class TaskAssignmentService : _BaseService, ITaskAssignmentService
    {
        private readonly ILogger<TaskAssignmentService> _logger;
        private readonly ITaskAssignmentRepository _taskAssignmentRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;
        public TaskAssignmentService(IPrincipal principal, ILogger<TaskAssignmentService> logger,
            ITaskAssignmentRepository taskAssignmentRepository,
            ITaskRepository taskRepository,
            IUserRepository userRepository
            ) : base(principal, logger, userRepository)
        {
            _logger = logger;
            _taskAssignmentRepository = taskAssignmentRepository;
            _taskRepository = taskRepository;
            _userRepository = userRepository;
        }
        public async Task<TaskAssignmentDto> AddTaskAssignmentAsync(CreateTaskAssignmentForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateTaskAssignmentForm)} is empty");
            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);
            _ = await _taskRepository.GetByIdAsync(form.TaskId) ?? throw new NotFoundException("Görev Bulunamadı!");
            _ = await _userRepository.GetByIdAsync(form.UserId) ?? throw new NotFoundException("Kullanıcı Bulunamadı!");
            var ta = TaskAssignmentMapper.Map(form);
            ta.CreatedAt = DateTime.UtcNow;
            ta.CreatedById = LoggedInUser.Id;
            _taskAssignmentRepository.Create(ta);
            await _taskAssignmentRepository.SaveChangesAsync();
            return TaskAssignmentMapper.Map(ta);
        }
        public async Task<List<TaskAssignmentDto>> GetAllTaskAssignments()
        {
            var tas = _taskAssignmentRepository.QueryAll();
            return TaskAssignmentMapper.Map(await tas.ToListAsync());
        }
        public async Task<TaskAssignmentDto> GetTaskAssignmentAsync(int taskAssignmentId)
        {
            var ta = await _taskAssignmentRepository.GetByIdAsync(taskAssignmentId);
            if (ta == null)
                throw new NotFoundException("Görev Ataması Bulunamadı!");
            return TaskAssignmentMapper.Map(ta);
        }
        public async Task DeleteTaskAssignmentAsync(int taskAssignmentId)
        {
            var ta = await _taskAssignmentRepository.GetByIdAsync(taskAssignmentId);
            if (ta == null)
                throw new NotFoundException("Görev Ataması Bulunamadı!");
            _taskAssignmentRepository.Delete(ta);
            await _taskAssignmentRepository.SaveChangesAsync();
        }
    }
}