using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;

namespace PMM.Domain.Interfaces.Services
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

}
