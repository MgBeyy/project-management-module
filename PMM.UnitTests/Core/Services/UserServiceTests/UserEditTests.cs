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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);
        mockRepo.Setup(x => x.Update(It.IsAny<User>()));
        mockRepo.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync((User)null);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

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
        var existingUser = new User { Id = 1, Name = "Old Name", Email = "old@example.com" };
        mockRepo.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(existingUser);

        var userService = new UserService(mockRepo.Object, mockLogger.Object, mockPrincipal.Object);

        // Act
        Func<Task> act = async () => await userService.EditUserAsync(1, null);

        // Assert
        await act.Should().ThrowAsync<ArgumentNullException>();

        mockRepo.Verify(x => x.Update(It.IsAny<User>()), Times.Never);
        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Never);
    }
}