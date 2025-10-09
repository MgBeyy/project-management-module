using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PMM.Core.Common;
using PMM.Core.DTOs;
using PMM.Core.Exceptions;
using PMM.Core.Forms;
using PMM.Core.Mappers;
using PMM.Core.Validators;
using PMM.Data.Repositories;
using System.Security.Principal;

namespace PMM.Core.Services
{
    public interface IActivityService
    {
        Task<ActivityDto> AddActivityAsync(CreateActivityForm form);
        Task<ActivityDto> GetActivityAsync(int activityId);
        Task<PagedResult<ActivityDto>> Query(QueryActivityForm form);
        Task<ActivityDto> EditActivityAsync(int activityId, UpdateActivityForm form);
        Task DeleteActivityAsync(int activityId);
        Task<List<ActivityDto>> GetActivitiesByTaskIdAsync(int taskId);
        Task<List<ActivityDto>> GetActivitiesByUserIdAsync(int userId);
    }

    public class ActivityService : _BaseService, IActivityService
    {
        private readonly ILogger<ActivityService> _logger;
        private readonly IActivityRepository _activityRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly IUserRepository _userRepository;

        public ActivityService(IPrincipal principal, ILogger<ActivityService> logger,
            IActivityRepository activityRepository,
            ITaskRepository taskRepository,
            IUserRepository userRepository
            ) : base(principal, logger, userRepository)
        {
            _logger = logger;
            _activityRepository = activityRepository;
            _taskRepository = taskRepository;
            _userRepository = userRepository;
        }

        public async Task<ActivityDto> AddActivityAsync(CreateActivityForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(CreateActivityForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            if (form.EndTime <= form.StartTime)
                throw new BusinessException("Bitiş zamanı başlangıç zamanından sonra olmalıdır!");

            _ = await _taskRepository.GetByIdAsync(form.TaskId) ?? throw new NotFoundException("Görev Bulunamadı!");
            _ = await _userRepository.GetByIdAsync(form.UserId) ?? throw new NotFoundException("Kullanıcı Bulunamadı!");

            var activity = ActivityMapper.Map(form);
            activity.CreatedAt = DateTime.UtcNow;
            activity.CreatedById = LoggedInUser.Id;

            _activityRepository.Create(activity);
            await _activityRepository.SaveChangesAsync();

            return ActivityMapper.Map(activity);
        }

        public async Task<ActivityDto> GetActivityAsync(int activityId)
        {
            var activity = await _activityRepository.GetByIdAsync(activityId);
            if (activity == null)
                throw new NotFoundException("Aktivite Bulunamadı!");

            return ActivityMapper.Map(activity);
        }

        public async Task<PagedResult<ActivityDto>> Query(QueryActivityForm form)
        {
            var query = _activityRepository.Query(x => true);

            if (!string.IsNullOrEmpty(form.Search))
            {
                query = query.Where(a =>
                    a.Description.ToLower().Contains(form.Search.Trim().ToLower())
                );
            }

            if (form.Id.HasValue)
                query = query.Where(a => a.Id == form.Id.Value);

            if (form.TaskId.HasValue)
                query = query.Where(a => a.TaskId == form.TaskId.Value);

            if (form.UserId.HasValue)
                query = query.Where(a => a.UserId == form.UserId.Value);

            if (!string.IsNullOrWhiteSpace(form.Description))
                query = query.Where(a => a.Description.ToLower().Contains(form.Description.Trim().ToLower()));

            if (form.StartTime.HasValue)
                query = query.Where(a => a.StartTime == form.StartTime.Value);

            if (form.StartTimeMin.HasValue)
                query = query.Where(a => a.StartTime >= form.StartTimeMin.Value);

            if (form.StartTimeMax.HasValue)
                query = query.Where(a => a.StartTime <= form.StartTimeMax.Value);

            if (form.EndTime.HasValue)
                query = query.Where(a => a.EndTime == form.EndTime.Value);

            if (form.EndTimeMin.HasValue)
                query = query.Where(a => a.EndTime >= form.EndTimeMin.Value);

            if (form.EndTimeMax.HasValue)
                query = query.Where(a => a.EndTime <= form.EndTimeMax.Value);

            if (form.TotalHours.HasValue)
                query = query.Where(a => a.TotalHours == form.TotalHours.Value);

            if (form.TotalHoursMin.HasValue)
                query = query.Where(a => a.TotalHours >= form.TotalHoursMin.Value);

            if (form.TotalHoursMax.HasValue)
                query = query.Where(a => a.TotalHours <= form.TotalHoursMax.Value);

            if (form.CreatedAt.HasValue)
                query = query.Where(a => a.CreatedAt == form.CreatedAt.Value);

            if (form.CreatedAtMin.HasValue)
                query = query.Where(a => a.CreatedAt >= form.CreatedAtMin.Value);

            if (form.CreatedAtMax.HasValue)
                query = query.Where(a => a.CreatedAt <= form.CreatedAtMax.Value);

            if (form.CreatedById.HasValue)
                query = query.Where(a => a.CreatedById == form.CreatedById.Value);

            if (form.UpdatedAt.HasValue)
                query = query.Where(a => a.UpdatedAt == form.UpdatedAt.Value);

            if (form.UpdatedAtMin.HasValue)
                query = query.Where(a => a.UpdatedAt >= form.UpdatedAtMin.Value);

            if (form.UpdatedAtMax.HasValue)
                query = query.Where(a => a.UpdatedAt <= form.UpdatedAtMax.Value);

            if (form.UpdatedById.HasValue)
                query = query.Where(a => a.UpdatedById == form.UpdatedById.Value);

            query = OrderByHelper.OrderByDynamic(query, form.SortBy, form.SortDesc);

            int page = form.Page ?? 1;
            int pageSize = form.PageSize ?? 10;
            int totalRecords = await query.CountAsync();
            var activities = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<ActivityDto>
            {
                Data = ActivityMapper.Map(activities),
                TotalRecords = totalRecords,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ActivityDto> EditActivityAsync(int activityId, UpdateActivityForm form)
        {
            if (form == null)
                throw new ArgumentNullException($"{typeof(UpdateActivityForm)} is empty");

            var validation = FormValidator.Validate(form);
            if (!validation.IsValid)
                throw new BusinessException(validation.Errors);

            if (form.EndTime <= form.StartTime)
                throw new BusinessException("Bitiş zamanı başlangıç zamanından sonra olmalıdır!");

            var activity = await _activityRepository.GetByIdAsync(activityId) ?? throw new NotFoundException("Aktivite Bulunamadı!");

            ActivityMapper.Map(form, activity);
            activity.UpdatedAt = DateTime.UtcNow;
            activity.UpdatedById = LoggedInUser.Id;

            _activityRepository.Update(activity);
            await _activityRepository.SaveChangesAsync();

            return ActivityMapper.Map(activity);
        }

        public async Task DeleteActivityAsync(int activityId)
        {
            var activity = await _activityRepository.GetByIdAsync(activityId);
            if (activity == null)
                throw new NotFoundException("Aktivite Bulunamadı!");

            _activityRepository.Delete(activity);
            await _activityRepository.SaveChangesAsync();
        }

        public async Task<List<ActivityDto>> GetActivitiesByTaskIdAsync(int taskId)
        {
            _ = await _taskRepository.GetByIdAsync(taskId) ?? throw new NotFoundException("Görev Bulunamadı!");

            var activities = _activityRepository.Query(a => a.TaskId == taskId);
            return ActivityMapper.Map(await activities.ToListAsync());
        }

        public async Task<List<ActivityDto>> GetActivitiesByUserIdAsync(int userId)
        {
            _ = await _userRepository.GetByIdAsync(userId) ?? throw new NotFoundException("Kullanıcı Bulunamadı!");

            var activities = _activityRepository.Query(a => a.UserId == userId);
            return ActivityMapper.Map(await activities.ToListAsync());
        }
    }
}
