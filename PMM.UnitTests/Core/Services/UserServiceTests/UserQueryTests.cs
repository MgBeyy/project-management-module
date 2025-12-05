using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Services;
using PMM.Data.Contexts;
using PMM.Domain.Entities;
using PMM.Domain.Forms;
using PMM.Domain.Interfaces.Repositories;
using PMM.Domain.Security;
using System.Linq.Expressions;
using System.Security.Principal;

namespace PMM.UnitTests.Core.Services.UserServiceTests;

public class UserQueryTests
{
    [Test]
    public async Task Query_WhenCalled_ShouldReturnPagedResult()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        var users = new List<User>
        {
            new User { Id = 1, Name = "John Doe", Email = "john@example.com" },
            new User { Id = 2, Name = "Jane Doe", Email = "jane@example.com" }
        };

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;
        var mockPrincipalApp = new Mock<IAppPrincipal>();
        mockPrincipalApp.Setup(p => p.Id).Returns(1);
        var context = new ApplicationDbContext(options, mockPrincipalApp.Object);
        context.Set<User>().AddRange(users);
        context.SaveChanges();

        mockRepo.Setup(x => x.Query(It.IsAny<Expression<Func<User, bool>>>()))
            .Returns(context.Set<User>().AsQueryable());

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object, new Mock<IProjectRepository>().Object, new Mock<ITaskRepository>().Object, new Mock<IActivityRepository>().Object, new Mock<IClientRepository>().Object, new Mock<IFileRepository>().Object, new Mock<ILabelRepository>().Object, new Mock<IReportRepository>().Object, new Mock<IProjectAssignmentRepository>().Object, new Mock<ITaskAssignmentRepository>().Object, new Mock<IProjectLabelRepository>().Object, new Mock<ITaskLabelRepository>().Object, new Mock<ITaskDependencyRepository>().Object, new Mock<IProjectRelationRepository>().Object);

        var queryForm = new QueryUserForm();

        // Act
        var result = await userService.Query(queryForm);

        // Assert
        result.Should().NotBeNull();
        result.Data.Should().HaveCount(2);
        result.Data.First().Name.Should().Be("John Doe");
    }
}