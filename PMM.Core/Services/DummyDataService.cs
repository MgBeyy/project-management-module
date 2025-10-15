using Microsoft.Extensions.Logging;
using PMM.Data.Entities;
using PMM.Data.Enums;
using PMM.Data.Repositories;

namespace PMM.Core.Services
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

    public class DummyDataService : IDummyDataService
    {
        private readonly IClientRepository _clientRepository;
        private readonly IUserRepository _userRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectRelationRepository _projectRelationRepository;
        private readonly IProjectAssignmentRepository _projectAssignmentRepository;
        private readonly ITaskRepository _taskRepository;
        private readonly ITaskAssignmentRepository _taskAssignmentRepository;
        private readonly IActivityRepository _activityRepository;
        private readonly ILabelRepository _labelRepository;
        private readonly IProjectLabelRepository _projectLabelRepository;
        private readonly ITaskLabelRepository _taskLabelRepository;
        private readonly ILogger<DummyDataService> _logger;
        private readonly Random _rand = new Random();

        // Sample data arrays for random generation
        private readonly string[] _companyNames = { "Acme Corp", "Beta Ltd", "Gamma Inc", "Delta Solutions", "Epsilon Tech", "Zeta Group", "Omega Innovations", "Alpha Systems", "Theta Digital", "Iota Services", "Nova Labs", "Quantum Co", "Phoenix Ltd", "Stellar Inc", "Cosmic Tech", "Orbit Solutions", "Galaxy Corp", "Matrix Systems", "Vector Ltd", "Prism Inc" };
        private readonly string[] _firstNames = { "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Linda", "Mike", "Nancy", "Oscar", "Paula", "Quinn", "Rachel", "Steve", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yvonne", "Zack" };
        private readonly string[] _lastNames = { "Anderson", "Brown", "Clark", "Davis", "Evans", "Fisher", "Garcia", "Harris", "Jackson", "Johnson", "King", "Lee", "Martin", "Nelson", "Parker", "Quinn", "Roberts", "Smith", "Taylor", "Williams" };
        private readonly string[] _projectTitles = { "E-commerce Platform", "Mobile Banking App", "Data Analytics Dashboard", "CRM System", "Inventory Management", "Social Media Platform", "Learning Management System", "Document Management", "Customer Support Portal", "Financial Planning Tool" };
        private readonly string[] _taskTitles = { "Database Design", "API Development", "UI/UX Design", "Testing", "Documentation", "Code Review", "Bug Fixing", "Performance Optimization", "Security Implementation", "Deployment Setup" };
        private readonly string[] _labelNames = { "Frontend", "Backend", "Database", "Testing", "Bug", "Enhancement", "Documentation", "Security", "Performance", "UI/UX", "API", "Mobile", "Web", "Desktop", "Critical", "High Priority", "Low Priority", "Research", "Prototype", "Production" };
        private readonly string[] _labelColors = { "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57", "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43", "#10AC84", "#EE5A24", "#0984E3", "#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#E17055", "#74B9FF", "#81ECEC" };

        public DummyDataService(
            IClientRepository clientRepository,
            IUserRepository userRepository,
            IProjectRepository projectRepository,
            IProjectRelationRepository projectRelationRepository,
            IProjectAssignmentRepository projectAssignmentRepository,
            ITaskRepository taskRepository,
            ITaskAssignmentRepository taskAssignmentRepository,
            IActivityRepository activityRepository,
            ILabelRepository labelRepository,
            IProjectLabelRepository projectLabelRepository,
            ITaskLabelRepository taskLabelRepository,
            ILogger<DummyDataService> logger)
        {
            _clientRepository = clientRepository;
            _userRepository = userRepository;
            _projectRepository = projectRepository;
            _projectRelationRepository = projectRelationRepository;
            _projectAssignmentRepository = projectAssignmentRepository;
            _taskRepository = taskRepository;
            _taskAssignmentRepository = taskAssignmentRepository;
            _activityRepository = activityRepository;
            _labelRepository = labelRepository;
            _projectLabelRepository = projectLabelRepository;
            _taskLabelRepository = taskLabelRepository;
            _logger = logger;
        }

        public async Task SeedAllAsync()
        {
            await SeedClientsAsync(10);
            await SeedUsersAsync(10);
            await SeedLabelsAsync(20);
            await SeedProjectsAsync(15);
            await SeedProjectAssignmentsAsync(30);
            await SeedTasksAsync(50);
            await SeedTaskAssignmentsAsync(80);
            await SeedActivitiesAsync(100);
            await SeedProjectLabelsAsync(40);
            await SeedTaskLabelsAsync(60);
        }

        public async Task SeedAllAsync(int count)
        {
            await SeedClientsAsync(count);
            await SeedUsersAsync(count);
            await SeedLabelsAsync(count);
            await SeedProjectsAsync(count);
            await SeedProjectAssignmentsAsync(count * 2);
            await SeedTasksAsync(count * 3);
            await SeedTaskAssignmentsAsync(count * 4);
            await SeedActivitiesAsync(count * 5);
            await SeedProjectLabelsAsync(count * 2);
            await SeedTaskLabelsAsync(count * 3);
        }

        public async Task<List<Client>> SeedClientsAsync(int count)
        {
            var clients = new List<Client>();

            for (int i = 0; i < count; i++)
            {
                var companyName = _companyNames[_rand.Next(_companyNames.Length)];
                var suffix = _rand.Next(1000, 9999);

                clients.Add(new Client
                {
                    Name = $"{companyName} {suffix}",
                });
            }

            await _clientRepository.CreateRangeAsync(clients);
            await _clientRepository.SaveChangesAsync();
            return clients;
        }

        public async Task<List<User>> SeedUsersAsync(int count)
        {
            var users = new List<User>();

            for (int i = 0; i < count; i++)
            {
                var firstName = _firstNames[_rand.Next(_firstNames.Length)];
                var lastName = _lastNames[_rand.Next(_lastNames.Length)];
                var randomNumber = _rand.Next(100, 999);

                users.Add(new User
                {
                    Name = $"{firstName} {lastName}",
                    Email = $"{firstName.ToLower()}.{lastName.ToLower()}{randomNumber}@example.com"
                });
            }

            await _userRepository.CreateRangeAsync(users);
            await _userRepository.SaveChangesAsync();
            return users;
        }

        public async Task<List<Project>> SeedProjectsAsync(int count)
        {
            var clients = _clientRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!clients.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed projects: No clients or users found");
                return new List<Project>();
            }

            var projects = new List<Project>();

            for (int i = 0; i < count; i++)
            {
                var randomUser = users[_rand.Next(users.Count)];
                var randomClient = clients[_rand.Next(clients.Count)];
                var startDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(_rand.Next(-30, 60));
                var projectTitle = _projectTitles[_rand.Next(_projectTitles.Length)];
                var randomSuffix = _rand.Next(100, 999);

                projects.Add(new Project
                {
                    Code = $"PRJ-{randomSuffix}",
                    Title = $"{projectTitle} {randomSuffix}",
                    PlannedStartDate = startDate,
                    PlannedDeadline = startDate.AddDays(_rand.Next(30, 180)),
                    PlannedHours = _rand.Next(50, 1000),
                    Status = (EProjectStatus)_rand.Next(0, Enum.GetNames(typeof(EProjectStatus)).Length),
                    Priority = (EProjectPriority)_rand.Next(0, Enum.GetNames(typeof(EProjectPriority)).Length),
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 90)),
                    CreatedById = randomUser.Id,
                    ClientId = randomClient.Id
                });
            }

            await _projectRepository.CreateRangeAsync(projects);
            await _projectRepository.SaveChangesAsync();
            return projects;
        }

        public async Task<List<ProjectAssignment>> SeedProjectAssignmentsAsync(int count)
        {
            var projects = _projectRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!projects.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed project assignments: No projects or users found");
                return new List<ProjectAssignment>();
            }

            var assignments = new List<ProjectAssignment>();
            var roles = (EProjectAssignmentRole[])Enum.GetValues(typeof(EProjectAssignmentRole));
            var createdAssignments = new HashSet<(int, int)>();

            for (int i = 0; i < count; i++)
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
                    StartedAt = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-_rand.Next(0, 60))),
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 30)),
                    CreatedById = user.Id
                });

                createdAssignments.Add((project.Id, user.Id));
            }

            await _projectAssignmentRepository.CreateRangeAsync(assignments);
            await _projectAssignmentRepository.SaveChangesAsync();
            return assignments;
        }

        public async Task<List<TaskEntity>> SeedTasksAsync(int count)
        {
            var projects = _projectRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!projects.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed tasks: No projects or users found");
                return new List<TaskEntity>();
            }

            var tasks = new List<TaskEntity>();
            var statuses = (ETaskStatus[])Enum.GetValues(typeof(ETaskStatus));

            for (int i = 0; i < count; i++)
            {
                var randomProject = projects[_rand.Next(projects.Count)];
                var randomUser = users[_rand.Next(users.Count)];
                var taskTitle = _taskTitles[_rand.Next(_taskTitles.Length)];
                var randomSuffix = _rand.Next(100, 999);

                tasks.Add(new TaskEntity
                {
                    ProjectId = randomProject.Id,
                    Title = $"{taskTitle} {randomSuffix}",
                    Description = $"Description for {taskTitle} task with ID {randomSuffix}",
                    Status = statuses[_rand.Next(statuses.Length)],
                    PlannedHours = (decimal)(_rand.NextDouble() * 40 + 1), // 1-40 hours
                    ActualHours = _rand.NextDouble() > 0.5 ? (decimal)(_rand.NextDouble() * 50 + 1) : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 60)),
                    CreatedById = randomUser.Id
                });
            }

            await _taskRepository.CreateRangeAsync(tasks);
            await _taskRepository.SaveChangesAsync();
            return tasks;
        }

        public async Task<List<TaskAssignment>> SeedTaskAssignmentsAsync(int count)
        {
            var tasks = _taskRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!tasks.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed task assignments: No tasks or users found");
                return new List<TaskAssignment>();
            }

            var assignments = new List<TaskAssignment>();
            var createdAssignments = new HashSet<(int, int)>();

            for (int i = 0; i < count; i++)
            {
                var task = tasks[_rand.Next(tasks.Count)];
                var user = users[_rand.Next(users.Count)];

                if (createdAssignments.Contains((task.Id, user.Id)))
                {
                    i--;
                    continue;
                }

                assignments.Add(new TaskAssignment
                {
                    TaskId = task.Id,
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 30)),
                    CreatedById = user.Id
                });

                createdAssignments.Add((task.Id, user.Id));
            }

            await _taskAssignmentRepository.CreateRangeAsync(assignments);
            await _taskAssignmentRepository.SaveChangesAsync();
            return assignments;
        }

        public async Task<List<Activity>> SeedActivitiesAsync(int count)
        {
            var tasks = _taskRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!tasks.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed activities: No tasks or users found");
                return new List<Activity>();
            }

            var activities = new List<Activity>();

            for (int i = 0; i < count; i++)
            {
                var randomTask = tasks[_rand.Next(tasks.Count)];
                var randomUser = users[_rand.Next(users.Count)];
                var startTime = DateTime.UtcNow.AddDays(-_rand.Next(0, 30)).AddHours(-_rand.Next(0, 23));
                var duration = TimeSpan.FromHours(_rand.NextDouble() * 8 + 0.5); // 0.5 to 8.5 hours

                activities.Add(new Activity
                {
                    TaskId = randomTask.Id,
                    UserId = randomUser.Id,
                    Description = $"Work done on task: {randomTask.Title}",
                    StartTime = startTime,
                    EndTime = startTime.Add(duration),
                    TotalHours = (decimal)duration.TotalHours,
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 15)),
                    CreatedById = randomUser.Id
                });
            }

            await _activityRepository.CreateRangeAsync(activities);
            await _activityRepository.SaveChangesAsync();
            return activities;
        }

        public async Task<List<Label>> SeedLabelsAsync(int count)
        {
            var users = _userRepository.QueryAll().ToList();

            if (!users.Any())
            {
                _logger.LogWarning("Cannot seed labels: No users found");
                return new List<Label>();
            }

            var labels = new List<Label>();

            for (int i = 0; i < count; i++)
            {
                var randomUser = users[_rand.Next(users.Count)];
                var labelName = _labelNames[_rand.Next(_labelNames.Length)];
                var randomSuffix = _rand.Next(100, 999);
                var color = _labelColors[_rand.Next(_labelColors.Length)];

                labels.Add(new Label
                {
                    Name = $"{labelName} {randomSuffix}",
                    Color = color,
                    Description = $"Label for {labelName} categorization",
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 60)),
                    CreatedById = randomUser.Id
                });
            }

            await _labelRepository.CreateRangeAsync(labels);
            await _labelRepository.SaveChangesAsync();
            return labels;
        }

        public async Task<List<ProjectLabel>> SeedProjectLabelsAsync(int count)
        {
            var projects = _projectRepository.QueryAll().ToList();
            var labels = _labelRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!projects.Any() || !labels.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed project labels: Missing projects, labels, or users");
                return new List<ProjectLabel>();
            }

            var projectLabels = new List<ProjectLabel>();
            var createdRelations = new HashSet<(int, int)>();

            for (int i = 0; i < count; i++)
            {
                var project = projects[_rand.Next(projects.Count)];
                var label = labels[_rand.Next(labels.Count)];
                var user = users[_rand.Next(users.Count)];

                if (createdRelations.Contains((project.Id, label.Id)))
                {
                    i--;
                    continue;
                }

                projectLabels.Add(new ProjectLabel
                {
                    ProjectId = project.Id,
                    LabelId = label.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 30)),
                    CreatedById = user.Id
                });

                createdRelations.Add((project.Id, label.Id));
            }

            await _projectLabelRepository.CreateRangeAsync(projectLabels);
            await _projectLabelRepository.SaveChangesAsync();
            return projectLabels;
        }

        public async Task<List<TaskLabel>> SeedTaskLabelsAsync(int count)
        {
            var tasks = _taskRepository.QueryAll().ToList();
            var labels = _labelRepository.QueryAll().ToList();
            var users = _userRepository.QueryAll().ToList();

            if (!tasks.Any() || !labels.Any() || !users.Any())
            {
                _logger.LogWarning("Cannot seed task labels: Missing tasks, labels, or users");
                return new List<TaskLabel>();
            }

            var taskLabels = new List<TaskLabel>();
            var createdRelations = new HashSet<(int, int)>();

            for (int i = 0; i < count; i++)
            {
                var task = tasks[_rand.Next(tasks.Count)];
                var label = labels[_rand.Next(labels.Count)];
                var user = users[_rand.Next(users.Count)];

                if (createdRelations.Contains((task.Id, label.Id)))
                {
                    i--;
                    continue;
                }

                taskLabels.Add(new TaskLabel
                {
                    TaskId = task.Id,
                    LabelId = label.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-_rand.Next(0, 30)),
                    CreatedById = user.Id
                });

                createdRelations.Add((task.Id, label.Id));
            }

            await _taskLabelRepository.CreateRangeAsync(taskLabels);
            await _taskLabelRepository.SaveChangesAsync();
            return taskLabels;
        }

        // ...existing private methods remain the same but are now obsolete...
        private async Task SeedClientsAsync()
        {
            // This method is kept for backward compatibility but should not be used
            await SeedClientsAsync(10);
        }

        private async Task SeedUsersAsync()
        {
            // This method is kept for backward compatibility but should not be used
            await SeedUsersAsync(10);
        }

        private async Task SeedProjectsAsync()
        {
            // This method is kept for backward compatibility but should not be used
            await SeedProjectsAsync(15);
        }

        private async Task SeedProjectAssignmentsAsync()
        {
            // This method is kept for backward compatibility but should not be used
            await SeedProjectAssignmentsAsync(30);
        }
    }
}