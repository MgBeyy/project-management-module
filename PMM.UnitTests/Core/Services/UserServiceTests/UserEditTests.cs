using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Exceptions;
using PMM.Core.Services;
using PMM.Domain.Entities;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using System.Security.Principal;

namespace PMM.UnitTests.Core.Services.UserServiceTests;

public class UserEditTests
{
    [Test]
    public async Task Edit_WhenUserExistsAndFormValid_ShouldReturnUpdatedUser()
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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);
        mockRepo.Setup(x => x.Update(It.IsAny<User>()));
        mockRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        var editForm = new CreateUserForm
        {
            Name = "New Name",
            Email = "new@example.com",
        };

        // Act
        var result = await userService.EditUserAsync(1, editForm);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Name");
        result.Email.Should().Be("new@example.com");

        mockRepo.Verify(x => x.Update(It.IsAny<User>()), Times.Once);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task Edit_WhenUserNotFound_ShouldThrowNotFoundException()
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

        var editForm = new CreateUserForm
        {
            Name = "New Name",
            Email = "new@example.com",
        };

        // Act
        Func<Task> act = async () => await userService.EditUserAsync(1, editForm);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("User Bulunamadý!");

        mockRepo.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Test]
    public async Task Edit_WhenFormInvalid_ShouldThrowBusinessException()
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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        var invalidForm = new CreateUserForm
        {
            Name = "", // Geçersiz, boþ isim
            Email = "invalid-email", // Geçersiz email
        };

        // Act
        Func<Task> act = async () => await userService.EditUserAsync(1, invalidForm);

        // Assert
        await act.Should().ThrowAsync<BusinessException>();

        mockRepo.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Test]
    public async Task Edit_WhenFormNull_ShouldThrowArgumentNullException()
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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        // Act
        Func<Task> act = async () => await userService.EditUserAsync(1, null);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();

        mockRepo.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }
}