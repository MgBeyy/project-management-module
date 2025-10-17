using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Core.Common;
using PMM.Domain.DTOs;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class TaskController : _BaseController
    {
        private readonly ITaskService _taskService;
        private readonly ITaskDependencyService _taskDependencyService;

        public TaskController(
            ILogger<TaskController> logger,
            ITaskService taskService,
            ITaskDependencyService taskDependencyService)
            : base(logger)
        {
            _taskService = taskService;
            _taskDependencyService = taskDependencyService;
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

        [ProducesResponseType(typeof(PagedResult<TaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet()]
        public async Task<ApiResponse> Query([FromQuery] QueryTaskForm form)
        {
            var tasks = await _taskService.Query(form);
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

        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{taskId:int}")]
        public async Task<ApiResponse> EditTask(int taskId, UpdateTaskForm form)
        {
            var task = await _taskService.EditTaskAsync(taskId, form);
            return new ApiResponse(task, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(List<TaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{taskId:int}/subtasks")]
        public async Task<ApiResponse> GetSubTasksByTaskId(int taskId)
        {
            var subTasks = await _taskService.GetSubTasksByTaskId(taskId);
            return new ApiResponse(subTasks, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(TaskDependenciesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet("{taskId:int}/dependencies")]
        public async Task<ApiResponse> GetTaskDependencies(int taskId)
        {
            var dependencies = await _taskDependencyService.GetTaskDependenciesAsync(taskId);
            return new ApiResponse(dependencies, StatusCodes.Status200OK);
        }

        [ProducesResponseType(typeof(TaskDependencyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost("dependencies")]
        public async Task<ApiResponse> CreateTaskDependency(CreateTaskDependencyForm form)
        {
            var dependency = await _taskDependencyService.CreateDependencyAsync(form);
            return new ApiResponse(dependency, StatusCodes.Status201Created);
        }

        [ProducesResponseType(typeof(TaskDependenciesDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("{taskId:int}/dependencies")]
        public async Task<ApiResponse> ManageTaskDependencies(int taskId, ManageTaskDependenciesForm form)
        {
            form.TaskId = taskId;
            var dependencies = await _taskDependencyService.ManageTaskDependenciesAsync(form);
            return new ApiResponse(dependencies, StatusCodes.Status200OK);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("dependencies/{blockingTaskId:int}/{blockedTaskId:int}")]
        public async Task<ApiResponse> RemoveTaskDependency(int blockingTaskId, int blockedTaskId)
        {
            await _taskDependencyService.RemoveDependencyAsync(blockingTaskId, blockedTaskId);
            return new ApiResponse("Bağımlılık başarıyla silindi", StatusCodes.Status204NoContent);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("dependencies/{dependencyId:int}")]
        public async Task<ApiResponse> RemoveTaskDependencyById(int dependencyId)
        {
            await _taskDependencyService.RemoveDependencyByIdAsync(dependencyId);
            return new ApiResponse("Bağımlılık başarıyla silindi", StatusCodes.Status204NoContent);
        }

        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete("{taskId:int}")]
        public async Task<ApiResponse> DeleteTask(int taskId)
        {
            await _taskService.DeleteTaskAsync(taskId);
            return new ApiResponse("Görev başarıyla silindi", StatusCodes.Status204NoContent);
        }

        [ProducesResponseType(typeof(List<TaskDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPut("bulk-status")]
        public async Task<ApiResponse> BulkUpdateTaskStatus(BulkUpdateTaskStatusForm form)
        {
            var tasks = await _taskService.BulkUpdateTaskStatusAsync(form);
            return new ApiResponse(tasks, StatusCodes.Status200OK);
        }
    }
}
