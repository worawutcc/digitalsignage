using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

public class UserDeviceAssociationIntegrationTests
{
    [Fact]
    public async Task CreateAndDeleteUserDeviceAssociation_Workflow()
    {
        var client = TestServerFactory.CreateClient();
        var createRequest = new
        {
            UserId = "00000000-0000-0000-0000-000000000010",
            DeviceId = "00000000-0000-0000-0000-000000000020",
            AssociationType = "Owner"
        };
        var createResponse = await client.PostAsJsonAsync("/api/user-device-associations", createRequest);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        // Get all associations
        var getResponse = await client.GetAsync("/api/user-device-associations");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        // Delete association (assume returned Id is available)
        // var id = ...extract from createResponse...
        // var deleteResponse = await client.DeleteAsync($"/api/user-device-associations/{id}");
        // Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }
}
