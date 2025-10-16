using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class TaskAssignmentController : _BaseController
    {
        private readonly ITaskAssignmentService _taskAssignmentService;
        public TaskAssignmentController(
            ILogger<TaskAssignmentController> logger,
            ITaskAssignmentService taskAssignmentService) : base(logger)
        {
            _taskAssignmentService = taskAssignmentService;
        }
        [ProducesResponseType(typeof(TaskAssignmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> Create(CreateTaskAssignmentForm form)
        {
            var assignment = await _taskAssignmentService.AddTaskAssignmentAsync(form);
            return new ApiResponse(assignment, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(List<TaskAssignmentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var assignments = await _taskAssignmentService.GetAllTaskAssignments();
            return new ApiResponse(assignments, StatusCodes.Status200OK);
        }
        [ProducesResponseType(typeof(TaskAssignmentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{taskAssignmentId:int}")]
        public async Task<ApiResponse> GetById(int taskAssignmentId)
        {
            var assignment = await _taskAssignmentService.GetTaskAssignmentAsync(taskAssignmentId);
            return new ApiResponse(assignment, StatusCodes.Status200OK);
        }
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{taskAssignmentId:int}")]
        public async Task<ApiResponse> Delete(int taskAssignmentId)
        {
            await _taskAssignmentService.DeleteTaskAssignmentAsync(taskAssignmentId);
            return new ApiResponse(StatusCodes.Status200OK);
        }
    }
}