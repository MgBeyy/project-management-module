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
        var existingUser = new User { Id = 1, Name = "John Doe", Email = "john@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync((User)null);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

        // Act
        Func<Task> act = async () => await userService.GetUserAsync(1);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage("User Bulunamadý!");
    }
}