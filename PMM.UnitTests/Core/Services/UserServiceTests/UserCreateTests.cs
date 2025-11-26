using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
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

        // Act
        var result = await userService.AddUserAsync(createForm);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("John Doe");
        result.Email.Should().Be("john.doe@example.com");

        mockRepo.Verify(x => x.Create(It.IsAny<User>()), Times.Once);

        mockRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
    }
}
