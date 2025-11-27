using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using PMM.Core.Exceptions;
using PMM.Core.Services;
using PMM.Domain.Entities;
using PMM.Domain.Interfaces.Repositories;
using System.Security.Principal;

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
        mockRepo.Setup(x => x.Delete(It.IsAny<User>()));
        mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync(new User { Id = 1, Name = "John Doe", Email = "john@doe.com" });
        mockRepo.Setup(x => x.SaveChangesAsync())
                .ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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
        mockRepo.Setup(x => x.Delete(It.IsAny<User>()));
        mockRepo.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((User)null);
        mockRepo.Setup(x => x.SaveChangesAsync())
                .ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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