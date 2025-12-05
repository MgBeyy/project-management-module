using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Exceptions;
using PMM.Core.Services;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;
using System.Security.Principal;
using System.Linq.Expressions;

namespace PMM.UnitTests;

public class UserDeleteTests
{
    [Test]
    public async Task Delete_WhenUserIsValid_ShouldPass()
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
        mockRepo.Setup(x => x.Delete(It.IsAny<User>()));
        mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new User { Id = 1, Name = "John Doe", Email = "john@doe.com" });
        mockRepo.Setup(x => x.SaveChangesAsync())
                .ReturnsAsync(1);
        // Setup all queries to return empty IQueryable (no dependencies)
        mockProjectRepo.Setup(x => x.Query(It.IsAny<Expression<Func<Project, bool>>>())).Returns(new List<Project>().AsQueryable());
        mockTaskRepo.Setup(x => x.Query(It.IsAny<Expression<Func<TaskEntity, bool>>>())).Returns(new List<TaskEntity>().AsQueryable());
        mockActivityRepo.Setup(x => x.Query(It.IsAny<Expression<Func<Activity, bool>>>())).Returns(new List<Activity>().AsQueryable());
        mockClientRepo.Setup(x => x.Query(It.IsAny<Expression<Func<Client, bool>>>())).Returns(new List<Client>().AsQueryable());
        mockFileRepo.Setup(x => x.Query(It.IsAny<Expression<Func<FileEntity, bool>>>())).Returns(new List<FileEntity>().AsQueryable());
        mockLabelRepo.Setup(x => x.Query(It.IsAny<Expression<Func<Label, bool>>>())).Returns(new List<Label>().AsQueryable());
        mockReportRepo.Setup(x => x.Query(It.IsAny<Expression<Func<Report, bool>>>())).Returns(new List<Report>().AsQueryable());
        mockProjectAssignmentRepo.Setup(x => x.Query(It.IsAny<Expression<Func<ProjectAssignment, bool>>>())).Returns(new List<ProjectAssignment>().AsQueryable());
        mockTaskAssignmentRepo.Setup(x => x.Query(It.IsAny<Expression<Func<TaskAssignment, bool>>>())).Returns(new List<TaskAssignment>().AsQueryable());
        mockProjectLabelRepo.Setup(x => x.Query(It.IsAny<Expression<Func<ProjectLabel, bool>>>())).Returns(new List<ProjectLabel>().AsQueryable());
        mockTaskLabelRepo.Setup(x => x.Query(It.IsAny<Expression<Func<TaskLabel, bool>>>())).Returns(new List<TaskLabel>().AsQueryable());
        mockTaskDependencyRepo.Setup(x => x.Query(It.IsAny<Expression<Func<TaskDependency, bool>>>())).Returns(new List<TaskDependency>().AsQueryable());
        mockProjectRelationRepo.Setup(x => x.Query(It.IsAny<Expression<Func<ProjectRelation, bool>>>())).Returns(new List<ProjectRelation>().AsQueryable());

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        var userId = 1;

        // Action
        await userService.DeleteUserAsync(userId);

        // Assert
        mockRepo.Verify(x => x.Delete(It.IsAny<User>()), Times.Once);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }
    [Test]
    public async Task Delete_WhenUserIdDoesNotExist_ShouldPass()
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
        mockRepo.Setup(x => x.Delete(It.IsAny<User>()));
        mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User)null);
        mockRepo.Setup(x => x.SaveChangesAsync())
                .ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, mockProjectRepo.Object, mockTaskRepo.Object, mockActivityRepo.Object, mockClientRepo.Object, mockFileRepo.Object, mockLabelRepo.Object, mockReportRepo.Object, mockProjectAssignmentRepo.Object, mockTaskAssignmentRepo.Object, mockProjectLabelRepo.Object, mockTaskLabelRepo.Object, mockTaskDependencyRepo.Object, mockProjectRelationRepo.Object);

        var userId = 1;

        // Action
        Func<Task> act = async () => await userService.DeleteUserAsync(userId);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("Kullanıcı Bulunamadı!");

        mockRepo.Verify(x => x.Delete(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }
}