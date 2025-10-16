using AutoWrapper.Wrappers;
using Microsoft.AspNetCore.Mvc;
using PMM.Domain.Interfaces.Services;

namespace PMM.API.Controllers
{
    public class DummyDataController : _BaseController
    {
        private readonly IDummyDataService _dummyDataService;
        public DummyDataController(ILogger<DummyDataController> logger, IDummyDataService dummyDataService) : base(logger)
        {
            _dummyDataService = dummyDataService;
        }

        [HttpPost("seed")]
        public async Task<ApiResponse> Seed()
        {
            try
            {
                await _dummyDataService.SeedAllAsync();
                return new ApiResponse("Dummy data seeded successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return new ApiResponse($"Error: {ex.Message} - Inner: {ex.InnerException?.Message}", null, 500);
            }
        }

        [HttpPost("seed-all/{count}")]
        public async Task<ApiResponse> SeedAll(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                await _dummyDataService.SeedAllAsync(count);
                return new ApiResponse($"Successfully seeded all entities with {count} records each (with proportional relationships)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding all data with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-clients/{count}")]
        public async Task<ApiResponse> SeedClients(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var clients = await _dummyDataService.SeedClientsAsync(count);
                return new ApiResponse($"Successfully created {clients.Count} clients", clients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding clients with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-users/{count}")]
        public async Task<ApiResponse> SeedUsers(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var users = await _dummyDataService.SeedUsersAsync(count);
                return new ApiResponse($"Successfully created {users.Count} users", users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding users with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-projects/{count}")]
        public async Task<ApiResponse> SeedProjects(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var projects = await _dummyDataService.SeedProjectsAsync(count);
                return new ApiResponse($"Successfully created {projects.Count} projects", projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding projects with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-project-assignments/{count}")]
        public async Task<ApiResponse> SeedProjectAssignments(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var assignments = await _dummyDataService.SeedProjectAssignmentsAsync(count);
                return new ApiResponse($"Successfully created {assignments.Count} project assignments", assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding project assignments with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-tasks/{count}")]
        public async Task<ApiResponse> SeedTasks(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var tasks = await _dummyDataService.SeedTasksAsync(count);
                return new ApiResponse($"Successfully created {tasks.Count} tasks", tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding tasks with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-task-assignments/{count}")]
        public async Task<ApiResponse> SeedTaskAssignments(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var assignments = await _dummyDataService.SeedTaskAssignmentsAsync(count);
                return new ApiResponse($"Successfully created {assignments.Count} task assignments", assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding task assignments with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-activities/{count}")]
        public async Task<ApiResponse> SeedActivities(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var activities = await _dummyDataService.SeedActivitiesAsync(count);
                return new ApiResponse($"Successfully created {activities.Count} activities", activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding activities with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-labels/{count}")]
        public async Task<ApiResponse> SeedLabels(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var labels = await _dummyDataService.SeedLabelsAsync(count);
                return new ApiResponse($"Successfully created {labels.Count} labels", labels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding labels with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-project-labels/{count}")]
        public async Task<ApiResponse> SeedProjectLabels(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var projectLabels = await _dummyDataService.SeedProjectLabelsAsync(count);
                return new ApiResponse($"Successfully created {projectLabels.Count} project labels", projectLabels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding project labels with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }

        [HttpPost("seed-task-labels/{count}")]
        public async Task<ApiResponse> SeedTaskLabels(int count)
        {
            try
            {
                if (count <= 0)
                    return new ApiResponse("Count must be greater than 0", null, 400);

                var taskLabels = await _dummyDataService.SeedTaskLabelsAsync(count);
                return new ApiResponse($"Successfully created {taskLabels.Count} task labels", taskLabels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding task labels with count {Count}", count);
                return new ApiResponse($"Error: {ex.Message}", null, 500);
            }
        }
    }
}
