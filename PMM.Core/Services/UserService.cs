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
    public class UserService : _BaseService, IUserService
    {
        private readonly ILogger<UserService> _logger;
        private readonly IProjectRepository _projectRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IActivityRepository _activityRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IFileRepository _fileRepository;
        private readonly ILabelRepository _labelRepository;
        private readonly IReportRepository _reportRepository;
        private readonly IProjectAssignmentRepository _projectAssignmentRepository;
        private readonly ITaskAssignmentRepository _taskAssignmentRepository;
        private readonly IProjectLabelRepository _projectLabelRepository;
        private readonly ITaskLabelRepository _taskLabelRepository;
        private readonly ITaskDependencyRepository _taskDependencyRepository;
        private readonly IProjectRelationRepository _projectRelationRepository;
        public UserService(IUserRepository userRepository,
            ILogger<UserService> logger,
            IPrincipal principal,
            IProjectRepository projectRepository,
            ITaskRepository taskRepository,
            IActivityRepository activityRepository,
            IClientRepository clientRepository,
            IFileRepository fileRepository,
            ILabelRepository labelRepository,
            IReportRepository reportRepository,
            IProjectAssignmentRepository projectAssignmentRepository,
            ITaskAssignmentRepository taskAssignmentRepository,
            IProjectLabelRepository projectLabelRepository,
            ITaskLabelRepository taskLabelRepository,
            ITaskDependencyRepository taskDependencyRepository,
            IProjectRelationRepository projectRelationRepository)
            : base(principal, logger, userRepository)
        {
            _logger = logger;
            _projectRepository = projectRepository;
            _taskRepository = taskRepository;
            _activityRepository = activityRepository;
            _clientRepository = clientRepository;
            _fileRepository = fileRepository;
            _labelRepository = labelRepository;
            _reportRepository = reportRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
            _taskAssignmentRepository = taskAssignmentRepository;
            _projectLabelRepository = projectLabelRepository;
            _taskLabelRepository = taskLabelRepository;
            _taskDependencyRepository = taskDependencyRepository;
            _projectRelationRepository = projectRelationRepository;
        }

        public async Task<UserDto> AddUserAsync(CreateUserForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateUserForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);


            if (await _userRepository.IsEmailExistsAsync(form.Email))
                throw new BusinessException("Bu email zaten kayıtlı!");

            var user = UserMapper.Map(form);

            _userRepository.Create(user);
            await _userRepository.SaveChangesAsync();
            return UserMapper.Map(user);
        }

        public async Task DeleteUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("Kullanıcı Bulunamadı!");

            // Check if user has created, updated, or deleted any entities
            var entitiesWithDependencies = new List<string>();

            if (await _projectRepository.Query(p => p.CreatedById == userId || p.UpdatedById == userId || p.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("projeler");
            if (await _taskRepository.Query(t => t.CreatedById == userId || t.UpdatedById == userId || t.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("görevler");
            if (await _activityRepository.Query(a => a.CreatedById == userId || a.UpdatedById == userId || a.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("aktiviteler");
            if (await _clientRepository.Query(c => c.CreatedById == userId || c.UpdatedById == userId || c.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("müşteriler");
            if (await _fileRepository.Query(f => f.CreatedById == userId || f.UpdatedById == userId || f.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("dosyalar");
            if (await _labelRepository.Query(l => l.CreatedById == userId || l.UpdatedById == userId || l.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("etiketler");
            if (await _reportRepository.Query(r => r.CreatedById == userId || r.UpdatedById == userId || r.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("raporlar");
            if (await _projectAssignmentRepository.Query(pa => pa.CreatedById == userId || pa.UpdatedById == userId || pa.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("proje atamaları");
            if (await _taskAssignmentRepository.Query(ta => ta.CreatedById == userId || ta.UpdatedById == userId || ta.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("görev atamaları");
            if (await _projectLabelRepository.Query(pl => pl.CreatedById == userId || pl.UpdatedById == userId || pl.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("proje etiketleri");
            if (await _taskLabelRepository.Query(tl => tl.CreatedById == userId || tl.UpdatedById == userId || tl.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("görev etiketleri");
            if (await _taskDependencyRepository.Query(td => td.CreatedById == userId || td.UpdatedById == userId || td.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("görev bağımlılıkları");
            if (await _projectRelationRepository.Query(pr => pr.CreatedById == userId || pr.UpdatedById == userId || pr.DeletedById == userId).AnyAsync())
                entitiesWithDependencies.Add("proje ilişkileri");

            if (entitiesWithDependencies.Any())
            {
                var message = $"Bu kullanıcı tarafından oluşturulan/güncellenen/silinen {string.Join(", ", entitiesWithDependencies)} bulunmaktadır. Kullanıcı silinemez!";
                throw new BusinessException(message);
            }

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<UserDto> EditUserAsync(int userId, CreateUserForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateUserForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.ErrorMessage);

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");

            user.Name = form.Name != null ? form.Name : user.Name;
            user.Email = form.Email != null ? form.Email : user.Email;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
            return UserMapper.Map(user);
        }

        public async Task<UserDto> GetUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User Bulunamadı!");
            return UserMapper.Map(user);
        }

        public async Task<PagedResult<UserDto>> Query(QueryUserForm form)
        {
            IQueryable<User> query = _userRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(e =>
                    e.Name.ToLower().Contains(form.Search.Trim().ToLower()) ||
                    e.Email.ToLower().Contains(form.Search.Trim().ToLower()));
            }

            if (form.IsActive.HasValue)
            {
                query = query.Where(e => e.IsActive == form.IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(form.AssignedProjectIds))
            {
                var projectIds = form.AssignedProjectIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Where(x => int.TryParse(x.Trim(), out _))
                                          .Select(x => int.Parse(x.Trim()))
                                          .ToList();

                if (projectIds.Any())
                {
                    query = query.Where(u => u.ProjectAssignments.Any(pa => projectIds.Contains(pa.ProjectId)));
                }
            }

            if (!string.IsNullOrWhiteSpace(form.AssignedTaskIds))
            {
                var taskIds = form.AssignedTaskIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                          .Where(x => int.TryParse(x.Trim(), out _))
                                          .Select(x => int.Parse(x.Trim()))
                                          .ToList();

                if (taskIds.Any())
                {
                    query = query.Where(u => u.TaskAssignments.Any(ta => taskIds.Contains(ta.TaskId)));
                }
            }

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;

            int totalRecords = await query.CountAsync();

            var users = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Get user ids
            var userIds = users.Select(u => u.Id).ToList();

            // Get relevant task ids: status Todo or InProgress, and PlannedStartDate <= today + 30
            var cutoffDate = DateOnly.FromDateTime(DateTime.Today.AddDays(30));
            var relevantTaskIds = await _taskRepository.Query(t =>
                (t.Status == ETaskStatus.Todo || t.Status == ETaskStatus.InProgress) &&
                t.PlannedStartDate.HasValue && t.PlannedStartDate.Value <= cutoffDate)
                .Select(t => t.Id)
                .ToListAsync();

            // Get task assignments for these users and relevant tasks
            var taskAssignments = await _taskAssignmentRepository.Query(ta => userIds.Contains(ta.UserId) && relevantTaskIds.Contains(ta.TaskId))
                .Include(ta => ta.Task)
                .ToListAsync();

            // Calculate capacity for each user
            var userDtos = UserMapper.Map(users);
            foreach (var userDto in userDtos)
            {
                var user = users.First(u => u.Id == userDto.Id);
                var userTaskAssignments = taskAssignments.Where(ta => ta.UserId == user.Id).ToList();
                var tasks = userTaskAssignments.Select(ta => ta.Task).ToList();

                // Calculate available hours in next 30 days
                var today = DateOnly.FromDateTime(DateTime.Today);
                var endDate = today.AddDays(29);
                var availableHours = WorkingHoursCalculator.CalculateWorkingHours(today, endDate);

                // Calculate allocated hours in next 30 days
                decimal allocatedHours = 0;
                foreach (var task in tasks)
                {
                    if (task.PlannedStartDate.HasValue && task.PlannedEndDate.HasValue && task.PlannedHours.HasValue)
                    {
                        var taskStart = task.PlannedStartDate.Value;
                        var taskEnd = task.PlannedEndDate.Value;
                        var plannedHours = task.PlannedHours.Value;

                        // Total working days for task
                        var totalWorkingDays = WorkingHoursCalculator.CalculateWorkingDays(taskStart, taskEnd);
                        if (totalWorkingDays <= 0) continue;
                        var dailyHours = plannedHours / totalWorkingDays;

                        // Overlapping period with next 30 days
                        var overlapStart = taskStart > today ? taskStart : today;
                        var overlapEnd = taskEnd < endDate ? taskEnd : endDate;

                        if (overlapStart <= overlapEnd)
                        {
                            var overlapWorkingDays = WorkingHoursCalculator.CalculateWorkingDays(overlapStart, overlapEnd);
                            allocatedHours += dailyHours * overlapWorkingDays;
                        }
                    }
                }

                userDto.Capacity = availableHours - allocatedHours;
            }

            return new PagedResult<UserDto>
            {
                Data = userDtos,
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task DeactivateUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("Kullanıcı Bulunamadı!");
            if (!user.IsActive)
                throw new BusinessException("Kullanıcı zaten deaktif!");
            user.IsActive = false;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task ActivateUserAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("Kullanıcı Bulunamadı!");
            if (user.IsActive)
                throw new BusinessException("Kullanıcı zaten aktif!");
            user.IsActive = true;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }
    }
}
