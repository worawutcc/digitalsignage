using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace DigitalSignage.Api.Tests.Controllers;

public class UserDeviceAssociationControllerTests
{
    [Fact]
    public async Task Post_UserDeviceAssociation_ReturnsCreated()
    {
        // Arrange
        var client = TestServerFactory.CreateClient();
        var request = new
        {
            UserId = "00000000-0000-0000-0000-000000000001",
            DeviceId = "00000000-0000-0000-0000-000000000002",
            AssociationType = "Owner"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/user-device-associations", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        // Optionally: check response body for expected DTO
    }

    [Fact]
    public async Task Get_UserDeviceAssociations_ReturnsOk()
    {
        var client = TestServerFactory.CreateClient();
        var response = await client.GetAsync("/api/user-device-associations");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // Optionally: check response body for expected list
    }

    [Fact]
    public async Task Get_UserDeviceAssociationById_ReturnsOk()
    {
        var client = TestServerFactory.CreateClient();
        var id = "00000000-0000-0000-0000-000000000003";
        var response = await client.GetAsync($"/api/user-device-associations/{id}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // Optionally: check response body for expected DTO
    }

    [Fact]
    public async Task Put_UserDeviceAssociation_ReturnsNoContent()
    {
        var client = TestServerFactory.CreateClient();
        var id = "00000000-0000-0000-0000-000000000003";
        var request = new
        {
            AssociationType = "Viewer",
            IsActive = false
        };
        var response = await client.PutAsJsonAsync($"/api/user-device-associations/{id}", request);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Delete_UserDeviceAssociation_ReturnsNoContent()
    {
        var client = TestServerFactory.CreateClient();
        var id = "00000000-0000-0000-0000-000000000003";
        var response = await client.DeleteAsync($"/api/user-device-associations/{id}");
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
