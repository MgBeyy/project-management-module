using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class ActivityController : _BaseController
    {
        private readonly IActivityService _activityService;

        public ActivityController(
            ILogger<ActivityController> logger,
            IActivityService activityService)
            : base(logger)
        {
            _activityService = activityService;
        }

        [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> CreateActivity(CreateActivityForm form)
        {
            var activity = await _activityService.AddActivityAsync(form);
            return new ApiResponse(activity, StatusCodes.Status201Created);
        }

        [ProducesResponseType(typeof(PagedResult<ActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> Query([FromQuery] QueryActivityForm form)
        {
            var activities = await _activityService.Query(form);
            return new ApiResponse(activities, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{activityId:int}")]
        public async Task<ApiResponse> GetActivityById(int activityId)
        {
            var activity = await _activityService.GetActivityAsync(activityId);
            return new ApiResponse(activity, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(ActivityDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{activityId:int}")]
        public async Task<ApiResponse> EditActivity(int activityId, UpdateActivityForm form)
        {
            var activity = await _activityService.EditActivityAsync(activityId, form);
            return new ApiResponse(activity, StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{activityId:int}")]
        public async Task<ApiResponse> DeleteActivity(int activityId)
        {
            await _activityService.DeleteActivityAsync(activityId);
            return new ApiResponse("Activity deleted successfully", StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(List<ActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("task/{taskId:int}")]
        public async Task<ApiResponse> GetActivitiesByTaskId(int taskId)
        {
            var activities = await _activityService.GetActivitiesByTaskIdAsync(taskId);
            return new ApiResponse(activities, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(List<ActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("user/{userId:int}")]
        public async Task<ApiResponse> GetActivitiesByUserId(int userId)
        {
            var activities = await _activityService.GetActivitiesByUserIdAsync(userId);
            return new ApiResponse(activities, StatusCodes.Status200OK);
        }
    }
}
