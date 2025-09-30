using DigitalSignage.Infrastructure.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using Xunit;

namespace DigitalSignage.Infrastructure.Tests.Services;

public class UserContextTests
{
    private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
    private readonly Mock<ILogger<UserContext>> _mockLogger;

    public UserContextTests()
    {
        _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
        _mockLogger = new Mock<ILogger<UserContext>>();
    }

    [Fact]
    public void GetCurrentUserId_WithValidJwtClaim_ReturnsCorrectUserId()
    {
        // Arrange
        const int expectedUserId = 12345;
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, result);
    }

    [Fact]
    public void GetCurrentUserId_WithNullHttpContext_ReturnsSystemUserId()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(null as HttpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithNullUser_ReturnsSystemUserId()
    {
        // Arrange
        var httpContext = new DefaultHttpContext
        {
            User = null
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithUnauthenticatedUser_ReturnsSystemUserId()
    {
        // Arrange
        var identity = new ClaimsIdentity(); // Not authenticated
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithMissingNameIdentifierClaim_ReturnsSystemUserId()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, "user@example.com"),
            new Claim(ClaimTypes.Name, "testuser")
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithInvalidUserIdFormat_ReturnsSystemUserId()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "not-a-number")
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithEmptyUserIdClaim_ReturnsSystemUserId()
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, string.Empty)
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Fact]
    public void GetCurrentUserId_WithNullUserIdClaim_ReturnsSystemUserId()
    {
        // Arrange - Create identity without any claims (simulating null claim scenario)
        var identity = new ClaimsIdentity("Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(-1, result);
    }

    [Theory]
    [InlineData("1")]
    [InlineData("999")]
    [InlineData("2147483647")] // Max int value
    public void GetCurrentUserId_WithValidUserIdFormats_ReturnsCorrectUserId(string userIdString)
    {
        // Arrange
        var expectedUserId = int.Parse(userIdString);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userIdString)
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, result);
    }

    [Theory]
    [InlineData("0")] // Edge case: zero
    [InlineData("-1")] // Negative number
    [InlineData("-999")] // Large negative
    public void GetCurrentUserId_WithEdgeCaseUserIds_ReturnsCorrectValue(string userIdString)
    {
        // Arrange
        var expectedUserId = int.Parse(userIdString);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userIdString)
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, result);
    }

    [Fact]
    public void GetCurrentUserIdOrNull_WithValidUser_ReturnsUserId()
    {
        // Arrange
        const int expectedUserId = 100;
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId.ToString())
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserIdOrNull();

        // Assert
        Assert.Equal(expectedUserId, result);
    }

    [Fact]
    public void GetCurrentUserIdOrNull_WithInvalidUser_ReturnsNull()
    {
        // Arrange
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(null as HttpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserIdOrNull();

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetCurrentUserId_WithMultipleClaims_ReturnsCorrectNameIdentifier()
    {
        // Arrange
        const int expectedUserId = 555;
        var claims = new[]
        {
            new Claim(ClaimTypes.Email, "test@example.com"),
            new Claim(ClaimTypes.Name, "testuser"),
            new Claim(ClaimTypes.NameIdentifier, expectedUserId.ToString()),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim("custom_claim", "custom_value")
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, result);
    }

    [Theory]
    [InlineData("Bearer", 777)]
    [InlineData("Cookie", 777)]
    [InlineData("Custom", 777)]
    public void GetCurrentUserId_WithDifferentAuthenticationTypes_WorksCorrectly(string authenticationType, int expectedUserId)
    {
        // Arrange
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, expectedUserId.ToString())
        };
        var identity = new ClaimsIdentity(claims, authenticationType);
        var principal = new ClaimsPrincipal(identity);
        
        var httpContext = new DefaultHttpContext
        {
            User = principal
        };
        
        _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(httpContext);
        var userContext = new UserContext(_mockHttpContextAccessor.Object);

        // Act
        var result = userContext.GetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, result);
    }
}