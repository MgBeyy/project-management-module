using PMM.Domain.Entities;

namespace PMM.Domain.Interfaces.Services
{
    public interface IDummyDataService
    {
        Task SeedAllAsync();
        Task SeedAllAsync(int count);
        Task<List<Client>> SeedClientsAsync(int count);
        Task<List<User>> SeedUsersAsync(int count);
        Task<List<Project>> SeedProjectsAsync(int count);
        Task<List<ProjectAssignment>> SeedProjectAssignmentsAsync(int count);
        Task<List<TaskEntity>> SeedTasksAsync(int count);
        Task<List<TaskAssignment>> SeedTaskAssignmentsAsync(int count);
        Task<List<Activity>> SeedActivitiesAsync(int count);
        Task<List<Label>> SeedLabelsAsync(int count);
        Task<List<ProjectLabel>> SeedProjectLabelsAsync(int count);
        Task<List<TaskLabel>> SeedTaskLabelsAsync(int count);
    }
}