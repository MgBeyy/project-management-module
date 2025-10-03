using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Core.Services;

namespace PMM.API.Controllers
{
    public class TaskController : _BaseController
    {
        private readonly ITaskService _taskService;
        public TaskController(
            ILogger<TaskController> logger,
            ITaskService taskService)
            : base(logger)
        {
            _taskService = taskService;
        }

        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost()]
        public async Task<ApiResponse> CreateTask(CreateTaskForm form)
        {
            var task = await _taskService.AddTaskAsync(form);
            return new ApiResponse(task, StatusCodes.Status201Created);
        }

        [ProducesResponseType(typeof(List<TaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> GetAll()
        {
            var tasks = await _taskService.GetAllTasks();
            return new ApiResponse(tasks, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{taskId:int}")]
        public async Task<ApiResponse> GetTaskById(int taskId)
        {
            var task = await _taskService.GetTaskAsync(taskId);
            return new ApiResponse(task, StatusCodes.Status200OK);
        }
    }
}
