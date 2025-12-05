using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Exceptions;
using PMM.Core.Services;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;
using System.Security.Principal;

namespace PMM.UnitTests.Core.Services.UserServiceTests;

public class UserGetTests
{
    [Test]
    public async Task Get_WhenUserExists_ShouldReturnUser()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        var mockProjectRepo = new Mock<IProjectRepository>();
        var mockTaskRepo = new Mock<ITaskRepository>();
        var mockActivityRepo = new Mock<IActivityRepository>();
        var mockClientRepo = new Mock<IClientRepository>();
        var mockFileRepo = new Mock<IFileRepository>();
        var mockLabelRepo = new Mock<ILabelRepository>();
        var mockReportRepo = new Mock<IReportRepository>();
        var mockProjectAssignmentRepo = new Mock<IProjectAssignmentRepository>();
        var mockTaskAssignmentRepo = new Mock<ITaskAssignmentRepository>();
        var mockProjectLabelRepo = new Mock<IProjectLabelRepository>();
        var mockTaskLabelRepo = new Mock<ITaskLabelRepository>();
        var mockTaskDependencyRepo = new Mock<ITaskDependencyRepository>();
        var mockProjectRelationRepo = new Mock<IProjectRelationRepository>();
        var existingUser = new User { Id = 1, Name = "John Doe", Email = "john@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        // Act
        var result = await userService.GetUserAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("John Doe");
        result.Email.Should().Be("john@example.com");
    }

    [Test]
    public async Task Get_WhenUserNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        var mockProjectRepo = new Mock<IProjectRepository>();
        var mockTaskRepo = new Mock<ITaskRepository>();
        var mockActivityRepo = new Mock<IActivityRepository>();
        var mockClientRepo = new Mock<IClientRepository>();
        var mockFileRepo = new Mock<IFileRepository>();
        var mockLabelRepo = new Mock<ILabelRepository>();
        var mockReportRepo = new Mock<IReportRepository>();
        var mockProjectAssignmentRepo = new Mock<IProjectAssignmentRepository>();
        var mockTaskAssignmentRepo = new Mock<ITaskAssignmentRepository>();
        var mockProjectLabelRepo = new Mock<IProjectLabelRepository>();
        var mockTaskLabelRepo = new Mock<ITaskLabelRepository>();
        var mockTaskDependencyRepo = new Mock<ITaskDependencyRepository>();
        var mockProjectRelationRepo = new Mock<IProjectRelationRepository>();
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync((User)null);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        // Act
        Func<Task> act = async () => await userService.GetUserAsync(1);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("User Bulunamadý!");
    }
}