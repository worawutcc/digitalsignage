using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

public class BulkAssociationTests
{
    [Fact]
    public async Task BulkCreateUserDeviceAssociations_ReturnsCreated()
    {
        var client = TestServerFactory.CreateClient();
        var bulkRequest = new[]
        {
            new { UserId = "00000000-0000-0000-0000-000000000011", DeviceId = "00000000-0000-0000-0000-000000000021", AssociationType = "Viewer" },
            new { UserId = "00000000-0000-0000-0000-000000000012", DeviceId = "00000000-0000-0000-0000-000000000022", AssociationType = "Manager" }
        };
        var response = await client.PostAsJsonAsync("/api/user-device-associations/bulk", bulkRequest);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
