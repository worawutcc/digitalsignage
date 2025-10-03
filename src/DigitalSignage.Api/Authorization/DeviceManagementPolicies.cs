using Microsoft.AspNetCore.Authorization;

namespace DigitalSignage.Api.Authorization;

/// <summary>
/// Authorization policies for device management operations
/// Following API copilot instructions for role-based access control
/// </summary>
public static class DeviceManagementPolicies
{
    // Policy names as constants
    public const string ViewDevices = "ViewDevices";
    public const string ManageDevices = "ManageDevices";
    public const string ManageDeviceStatus = "ManageDeviceStatus";
    public const string ViewDeviceHeartbeat = "ViewDeviceHeartbeat";
    public const string RegisterDevices = "RegisterDevices";
    public const string DeactivateDevices = "DeactivateDevices";
    public const string ViewDeviceHistory = "ViewDeviceHistory";
    public const string ManageDeviceConfiguration = "ManageDeviceConfiguration";
    public const string ViewOwnDevices = "ViewOwnDevices";
    public const string ManageOwnDevices = "ManageOwnDevices";

    /// <summary>
    /// Register all device management authorization policies
    /// </summary>
    public static void AddPolicies(AuthorizationOptions options)
    {
        // View Devices - Admin, Manager, and Users can view devices
        options.AddPolicy(ViewDevices, policy =>
            policy.RequireRole("Admin", "Manager", "User"));

        // Manage Devices - Only Admin and Manager can create, update, delete devices
        options.AddPolicy(ManageDevices, policy =>
            policy.RequireRole("Admin", "Manager"));

        // Manage Device Status - Admin and Manager can manually change device status
        options.AddPolicy(ManageDeviceStatus, policy =>
            policy.RequireRole("Admin", "Manager"));

        // View Device Heartbeat - Admin, Manager can see heartbeat data
        options.AddPolicy(ViewDeviceHeartbeat, policy =>
            policy.RequireRole("Admin", "Manager"));

        // Register Devices - Admin and Manager can register new devices
        options.AddPolicy(RegisterDevices, policy =>
            policy.RequireRole("Admin", "Manager"));

        // Deactivate Devices - Only Admin can deactivate devices
        options.AddPolicy(DeactivateDevices, policy =>
            policy.RequireRole("Admin"));

        // View Device History - Admin and Manager can view device status history
        options.AddPolicy(ViewDeviceHistory, policy =>
            policy.RequireRole("Admin", "Manager"));

        // Manage Device Configuration - Admin and Manager can configure devices
        options.AddPolicy(ManageDeviceConfiguration, policy =>
            policy.RequireRole("Admin", "Manager"));

        // View Own Devices - Users can view devices assigned to them
        options.AddPolicy(ViewOwnDevices, policy =>
            policy.RequireRole("Admin", "Manager", "User"));

        // Manage Own Devices - Users can update basic info of devices assigned to them
        options.AddPolicy(ManageOwnDevices, policy =>
            policy.RequireRole("Admin", "Manager", "User"));
    }

    /// <summary>
    /// Check if user can view specific device based on role and ownership
    /// </summary>
    public static bool CanViewDevice(string userRole, int userId, int? deviceManagedByUserId, int? deviceAssignedUserId)
    {
        // Admin and Manager can view all devices
        if (userRole == "Admin" || userRole == "Manager")
            return true;

        // Users can view devices they manage or are assigned to
        if (userRole == "User")
        {
            return deviceManagedByUserId == userId || deviceAssignedUserId == userId;
        }

        return false;
    }

    /// <summary>
    /// Check if user can manage specific device based on role and ownership
    /// </summary>
    public static bool CanManageDevice(string userRole, int userId, int? deviceManagedByUserId)
    {
        // Admin and Manager can manage all devices
        if (userRole == "Admin" || userRole == "Manager")
            return true;

        // Users can manage devices they are assigned to manage
        if (userRole == "User")
        {
            return deviceManagedByUserId == userId;
        }

        return false;
    }

    /// <summary>
    /// Check if user can deactivate specific device
    /// </summary>
    public static bool CanDeactivateDevice(string userRole)
    {
        // Only Admin can deactivate devices
        return userRole == "Admin";
    }

    /// <summary>
    /// Check if user can view device heartbeat and status details
    /// </summary>
    public static bool CanViewDeviceHeartbeat(string userRole)
    {
        // Admin and Manager can view heartbeat data
        return userRole == "Admin" || userRole == "Manager";
    }

    /// <summary>
    /// Check if user can register new devices
    /// </summary>
    public static bool CanRegisterDevices(string userRole)
    {
        // Admin and Manager can register devices
        return userRole == "Admin" || userRole == "Manager";
    }

    /// <summary>
    /// Check if user can view device status history
    /// </summary>
    public static bool CanViewDeviceHistory(string userRole)
    {
        // Admin and Manager can view device history
        return userRole == "Admin" || userRole == "Manager";
    }

    /// <summary>
    /// Check if user can configure device settings
    /// </summary>
    public static bool CanConfigureDevice(string userRole, int userId, int? deviceManagedByUserId)
    {
        // Admin and Manager can configure all devices
        if (userRole == "Admin" || userRole == "Manager")
            return true;

        // Users can configure devices they manage
        if (userRole == "User")
        {
            return deviceManagedByUserId == userId;
        }

        return false;
    }
}