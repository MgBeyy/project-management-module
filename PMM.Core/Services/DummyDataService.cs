using Microsoft.Extensions.Logging;
using PMM.Data.Entities;
using PMM.Data.Enums;
using PMM.Data.Repositories;

namespace PMM.Core.Services
{
    public interface IDummyDataService
    {
        Task SeedAllAsync();
    }

    public class DummyDataService : IDummyDataService
    {
        private readonly IClientRepository _clientRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectRelationRepository _projectRelationRepository;
        private readonly IProjectAssignmentRepository _projectAssignmentRepository;
        private readonly ILogger<DummyDataService> _logger;
        private readonly Random _rand = new Random();

        public DummyDataService(
            IClientRepository clientRepository,
            IUserRepository userRepository,
            IProjectRepository projectRepository,
            IProjectRelationRepository projectRelationRepository,
            IProjectAssignmentRepository projectAssignmentRepository,
            ILogger<DummyDataService> logger)
        {
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _projectRepository = projectRepository;
            _projectRelationRepository = projectRelationRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
            _logger = logger;
        }

        public async Task SeedAllAsync()
        {
            await SeedClientsAsync();
            await SeedUsersAsync();
            await SeedProjectsAsync();
            await SeedProjectAssignmentsAsync();
        }

        private async Task SeedClientsAsync()
        {
            if (_clientRepository.QueryAll().Any()) return;

            var clients = new List<Client>
            {
                new Client { Name = "Acme Corp" },
                new Client { Name = "Beta Ltd" },
                new Client { Name = "Gamma Inc" },
                new Client { Name = "Delta Solutions" },
                new Client { Name = "Epsilon Tech" },
                new Client { Name = "Zeta Group" },
                new Client { Name = "Omega Innovations" },
                new Client { Name = "Alpha Systems" },
                new Client { Name = "Theta Digital" },
                new Client { Name = "Iota Services" }
            };
            await _clientRepository.CreateRangeAsync(clients);
            await _clientRepository.SaveChangesAsync();
        }

        private async Task SeedUsersAsync()
        {
            if (_userRepository.QueryAll().Any()) return;

            var users = new List<User>
            {
                new User { Name = "Alice", Email = "alice@example.com" },
                new User { Name = "Bob", Email = "bob@example.com" },
                new User { Name = "Charlie", Email = "charlie@example.com" },
                new User { Name = "David", Email = "david@example.com" },
                new User { Name = "Eve", Email = "eve@example.com" },
                new User { Name = "Frank", Email = "frank@example.com" },
                new User { Name = "Grace", Email = "grace@example.com" },
                new User { Name = "Heidi", Email = "heidi@example.com" },
                new User { Name = "Ivan", Email = "ivan@example.com" },
                new User { Name = "Judy", Email = "judy@example.com" }
            };
            await _userRepository.CreateRangeAsync(users);
            await _userRepository.SaveChangesAsync();
        }

        private async Task SeedProjectsAsync()
        {
            if (_projectRepository.QueryAll().Any()) return;

            var clients = _clientRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!clients.Any() || !users.Any())
                return;

            var projects = new List<Project>();

            for (int i = 1; i <= 5; i++)
            {
                var randomUser = users[_rand.Next(users.Count)];
                var randomClient = clients[_rand.Next(clients.Count)];
                var startDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(_rand.Next(-10, 10));

                projects.Add(new Project
                {
                    Code = $"PRJ-P{i:000}",
                    Title = $"Ana Proje {i}",
                    PlannedStartDate = startDate,
                    PlannedDeadline = startDate.AddDays(_rand.Next(30, 90)),
                    PlannedHours = _rand.Next(100, 500),
                    Status = (EProjectStatus)_rand.Next(0, Enum.GetNames(typeof(EProjectStatus)).Length),
                    Priority = (EProjectPriority)_rand.Next(0, Enum.GetNames(typeof(EProjectPriority)).Length),
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = randomUser.Id,
                    ClientId = randomClient.Id
                });
            }

            await _projectRepository.CreateRangeAsync(projects);
            await _projectRepository.SaveChangesAsync();

            var parentProjects = _projectRepository.QueryAll().ToList();
            if (!parentProjects.Any()) return;

            var childProjects = new List<Project>();
            for (int i = 1; i <= 10; i++)
            {
                var randomUser = users[_rand.Next(users.Count)];
                var randomClient = clients[_rand.Next(clients.Count)];
                var startDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(_rand.Next(5, 20));

                childProjects.Add(new Project
                {
                    Code = $"PRJ-C{i:000}",
                    Title = $"Alt Proje {i}",
                    PlannedStartDate = startDate,
                    PlannedDeadline = startDate.AddDays(_rand.Next(15, 60)),
                    PlannedHours = _rand.Next(50, 250),
                    Status = (EProjectStatus)_rand.Next(0, Enum.GetNames(typeof(EProjectStatus)).Length),
                    Priority = (EProjectPriority)_rand.Next(0, Enum.GetNames(typeof(EProjectPriority)).Length),
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = randomUser.Id,
                    ClientId = randomClient.Id
                });
            }

            await _projectRepository.CreateRangeAsync(childProjects);
            await _projectRepository.SaveChangesAsync();

            var allProjects = _projectRepository.QueryAll().ToList();
            var projectRelations = new List<ProjectRelation>();

            foreach (var childProject in childProjects)
            {
                var parentCount = _rand.Next(1, 4);
                var selectedParents = parentProjects.OrderBy(x => Guid.NewGuid()).Take(parentCount).ToList();

                foreach (var parentProject in selectedParents)
                {
                    projectRelations.Add(new ProjectRelation
                    {
                        ParentProjectId = parentProject.Id,
                        ChildProjectId = childProject.Id,
                        CreatedAt = DateTime.UtcNow,
                        CreatedById = users[_rand.Next(users.Count)].Id
                    });
                }
            }

            await _projectRelationRepository.CreateRangeAsync(projectRelations);
            await _projectRelationRepository.SaveChangesAsync();
        }

        private async Task SeedProjectAssignmentsAsync()
        {
            if (_projectAssignmentRepository.QueryAll().Any()) return;

            var projects = _projectRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();
            if (projects.Count == 0 || users.Count == 0)
                return;

            var assignments = new List<ProjectAssignment>();
            var roles = (EProjectAssignmentRole[])Enum.GetValues(typeof(EProjectAssignmentRole));

            var createdAssignments = new HashSet<(int, int)>();

            for (int i = 0; i < 30; i++)
            {
                var project = projects[_rand.Next(projects.Count)];
                var user = users[_rand.Next(users.Count)];

                if (createdAssignments.Contains((project.Id, user.Id)))
                {
                    i--;
                    continue;
                }

                assignments.Add(new ProjectAssignment
                {
                    ProjectId = project.Id,
                    UserId = user.Id,
                    Role = roles[_rand.Next(roles.Length)], 
                    CreatedAt = DateTime.UtcNow,
                    CreatedById = user.Id
                });

                createdAssignments.Add((project.Id, user.Id));
            }

            await _projectAssignmentRepository.CreateRangeAsync(assignments);
            await _projectAssignmentRepository.SaveChangesAsync();
        }
    }
}