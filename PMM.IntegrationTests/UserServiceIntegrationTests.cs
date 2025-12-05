using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Exceptions;
using PMM.Core.Services;
using PMM.Data.Contexts;
using PMM.Data.Repositories;
using PMM.Domain.Entities;
using PMM.Domain.Forms;
using PMM.Domain.Security;
using Shouldly;
using System.Security.Principal;
using Testcontainers.PostgreSql;

namespace PMM.IntegrationTests;

[TestFixture]
public class UserServiceIntegrationTests
{
    private PostgreSqlContainer _postgresContainer;
    private ApplicationDbContext _context;
    private UserService _userService;

    [OneTimeSetUp]
    public async Task OneTimeSetUp()
    {
        // Start PostgreSQL container
        _postgresContainer = new PostgreSqlBuilder()
            .WithDatabase("testdb")
            .WithUsername("testuser")
            .WithPassword("testpass")
            .Build();

        await _postgresContainer.StartAsync();
    }

    [OneTimeTearDown]
    public async Task OneTimeTearDown()
    {
        await _postgresContainer.DisposeAsync();
    }

    [SetUp]
    public async Task SetUp()
    {
        // Create DbContext with container connection string
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_postgresContainer.GetConnectionString())
            .Options;

        var mockPrincipal = new Mock<IAppPrincipal>();
        mockPrincipal.Setup(p => p.Id).Returns(1);

        _context = new ApplicationDbContext(options, mockPrincipal.Object);

        // Run migrations
        await _context.Database.EnsureCreatedAsync();

        // Create repository and service
        var logger = new Mock<ILogger<UserRepository>>();
        var userRepository = new UserRepository(_context, logger.Object);

        var projectLogger = new Mock<ILogger<ProjectRepository>>();
        var projectRepository = new ProjectRepository(_context, projectLogger.Object);

        var taskLogger = new Mock<ILogger<TaskRepository>>();
        var taskRepository = new TaskRepository(_context, taskLogger.Object);

        var activityLogger = new Mock<ILogger<ActivityRepository>>();
        var activityRepository = new ActivityRepository(_context, activityLogger.Object);

        var clientLogger = new Mock<ILogger<ClientRepository>>();
        var clientRepository = new ClientRepository(_context, clientLogger.Object);

        var fileLogger = new Mock<ILogger<FileRepository>>();
        var fileRepository = new FileRepository(_context, fileLogger.Object);

        var labelLogger = new Mock<ILogger<LabelRepository>>();
        var labelRepository = new LabelRepository(_context, labelLogger.Object);

        var reportLogger = new Mock<ILogger<ReportRepository>>();
        var reportRepository = new ReportRepository(_context, reportLogger.Object);

        var projectAssignmentLogger = new Mock<ILogger<ProjectAssignmentRepository>>();
        var projectAssignmentRepository = new ProjectAssignmentRepository(_context, projectAssignmentLogger.Object);

        var taskAssignmentLogger = new Mock<ILogger<TaskAssignmentRepository>>();
        var taskAssignmentRepository = new TaskAssignmentRepository(_context, taskAssignmentLogger.Object);

        var projectLabelLogger = new Mock<ILogger<ProjectLabelRepository>>();
        var projectLabelRepository = new ProjectLabelRepository(_context, projectLabelLogger.Object);

        var taskLabelLogger = new Mock<ILogger<TaskLabelRepository>>();
        var taskLabelRepository = new TaskLabelRepository(_context, taskLabelLogger.Object);

        var taskDependencyLogger = new Mock<ILogger<TaskDependencyRepository>>();
        var taskDependencyRepository = new TaskDependencyRepository(_context, taskDependencyLogger.Object);

        var projectRelationLogger = new Mock<ILogger<ProjectRelationRepository>>();
        var projectRelationRepository = new ProjectRelationRepository(_context, projectRelationLogger.Object);

        var serviceLogger = new Mock<ILogger<UserService>>();
        var principal = new Mock<IPrincipal>();

        _userService = new UserService(userRepository, serviceLogger.Object, principal.Object, projectRepository, taskRepository, activityRepository, clientRepository, fileRepository, labelRepository, reportRepository, projectAssignmentRepository, taskAssignmentRepository, projectLabelRepository, taskLabelRepository, taskDependencyRepository, projectRelationRepository);
    }

    [TearDown]
    public async Task TearDown()
    {
        // Clean up database
        await _context.Database.EnsureDeletedAsync();
        await _context.DisposeAsync();
    }

    [Test]
    public async Task AddUserAsync_WhenValidForm_ShouldCreateUserSuccessfully()
    {
        // Arrange
        var createForm = new CreateUserForm
        {
            Name = "John Doe",
            Email = "john.doe@example.com"
        };

        // Act
        var result = await _userService.AddUserAsync(createForm);

        // Assert
        result.ShouldNotBeNull();
        result.Name.ShouldBe("John Doe");
        result.Email.ShouldBe("john.doe@example.com");
        result.Id.ShouldBeGreaterThan(0);

        // Verify in database
        var userInDb = await _context.Set<User>().FindAsync(result.Id);
        userInDb.ShouldNotBeNull();
        userInDb.Name.ShouldBe("John Doe");
        userInDb.Email.ShouldBe("john.doe@example.com");
    }

    [Test]
    public async Task AddUserAsync_WhenEmailAlreadyExists_ShouldThrowBusinessException()
    {
        // Arrange
        var user = await _context.Set<User>().AddAsync(
            new User
            {
                Name = "John Doe",
                Email = "john.doe@example.com"
            });
        await _context.SaveChangesAsync();

        var createForm2 = new CreateUserForm
        {
            Name = "Jane Doe",
            Email = "john.doe@example.com" // Same email
        };

        // Act
        Func<Task> act = async () => await _userService.AddUserAsync(createForm2);

        // Assert
        var exception = await act.ShouldThrowAsync<BusinessException>();
        exception.Message.ShouldBe("Bu email zaten kayýtlý!");
    }

    [Test]
    public async Task DeleteUserAsync_WhenValidId_ShouldDeleteUserSuccessfully()
    {
        // Arrange
        var user = await _context.Set<User>().AddAsync(new User { Name = "Ahmet", Email = "ahmet@onlu.com" });
        await _context.SaveChangesAsync();
        var userId = user.Entity.Id;

        // Act
        await _userService.DeleteUserAsync(userId);

        // Assert
        // Verify in database
        var userInDb = await _context.Set<User>().FindAsync(userId);
        if (userInDb == null)
        {
            Assert.Fail("User should exist in database.");
        }
        else
        {
            userInDb.IsDeleted.ShouldBeTrue();
        }
    }
    [Test]
    public async Task DeleteUserAsync_WhenInvalidId_ShouldThrowNotFoundException()
    {
        // Arrange
        var invalidUserId = 9999; // Assuming this ID does not exist

        // Act
        Func<Task> act = async () => await _userService.DeleteUserAsync(invalidUserId);

        // Assert
        var exception = await act.ShouldThrowAsync<NotFoundException>();
        exception.Message.ShouldBe("Kullanýcý Bulunamadý!");
    }
    [Test]
    public async Task EditUserAsync_WhenValidForm_ShouldUpdateUserSuccessfully()
    {
        // Arrange
        var user = await _context.Set<User>().AddAsync(new User
        {
            Name = "Mehmet",
            Email = "mehmet@test.me"
        });
        await _context.SaveChangesAsync();

        var userId = user.Entity.Id;

        // Act
        var updateForm = new CreateUserForm
        {
            Name = "Mehmet Updated",
            Email = "mehmet@test.me"
        };

        var result = await _userService.EditUserAsync(userId, updateForm);

        // Assert
        result.ShouldNotBeNull();
        result.Name.ShouldBe("Mehmet Updated");
        result.Email.ShouldBe("mehmet@test.me");

        // Verify in database
        var userInDb = await _context.Set<User>().FindAsync(userId);
        userInDb.ShouldNotBeNull();
        userInDb.Name.ShouldBe("Mehmet Updated");
        userInDb.Email.ShouldBe("mehmet@test.me");
    }
}