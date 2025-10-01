using Microsoft.AspNetCore.Authorization;

namespace DigitalSignage.Api.Authorization;

public static class UserDeviceAssociationPolicies
{
    public const string ManageAssociation = "ManageUserDeviceAssociation";
    public static void AddPolicies(AuthorizationOptions options)
    {
        options.AddPolicy(ManageAssociation, policy =>
            policy.RequireRole("Admin", "Manager"));
    }
}
