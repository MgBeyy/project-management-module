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

public class UserCreateTests
{
    [Test]
    public async Task Create_WhenUserIsValid_ShouldReturnUser()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        mockRepo.Setup(x => x.IsEmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        mockRepo.Setup(x => x.Create(It.IsAny<User>()));
        mockRepo.Setup(x => x.SaveChangesAsync())
                .ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

        var createForm = new CreateUserForm
        {
            Name = "John Doe",
            Email = "john.doe@example.com",
        };

        // Action
        var result = await userService.AddUserAsync(createForm);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("John Doe");
        result.Email.Should().Be("john.doe@example.com");

        mockRepo.Verify(x => x.Create(It.IsAny<User>()), Times.Once);

        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [Test]
    public async Task Create_WhenEmailAlreadyExists_ShouldThrowBusinessException()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        mockRepo.Setup(x => x.IsEmailExistsAsync(It.IsAny<string>())).ReturnsAsync(true);
        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);
        var createForm = new CreateUserForm
        {
            Name = "Jane Doe",
            Email = "john.doe@example.com",
        };

        // Action
        Func<Task> act = async () => await userService.AddUserAsync(createForm);

        // Assert
        await act.Should().ThrowAsync<BusinessException>()
        .WithMessage("Bu email zaten kayıtlı!");

        mockRepo.Verify(x => x.Create(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);

    }

    [Test]
    public async Task Create_WhenFormInvalid_ShouldThrowBusinessException()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();
        mockRepo.Setup(x => x.IsEmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

        var invalidForm = new CreateUserForm
        {
            Name = "", // Geçersiz
            Email = "invalid-email",
        };

        // Act
        Func<Task> act = async () => await userService.AddUserAsync(invalidForm);

        // Assert
        await act.Should().ThrowAsync<BusinessException>();

        mockRepo.Verify(x => x.Create(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [Test]
    public async Task Create_WhenFormNull_ShouldThrowArgumentNullException()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        var mockLogger = new Mock<ILogger<UserService>>();
        var mockPrincipal = new Mock<IPrincipal>();

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

        // Act
        Func<Task> act = async () => await userService.AddUserAsync(null);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();

        mockRepo.Verify(x => x.Create(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

}
