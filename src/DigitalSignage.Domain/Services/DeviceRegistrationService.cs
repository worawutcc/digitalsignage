using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Services;

/// <summary>
/// Domain service for managing Android TV device registration workflow
/// Handles PIN-based registration, device approval logic, and audit trail
/// </summary>
public interface IDeviceRegistrationService
{
    /// <summary>
    /// Generate a unique registration PIN for new device
    /// </summary>
    string GenerateRegistrationPin();
    
    /// <summary>
    /// Validate device registration request data
    /// </summary>
    (bool isValid, List<string> errors) ValidateRegistrationRequest(
        string deviceName, 
        string macAddress, 
        string androidVersion, 
        string apiLevel,
        string serialNumber,
        string manufacturer,
        string model);
    
    /// <summary>
    /// Create device registration record with pending status
    /// </summary>
    Device CreatePendingDevice(
        string deviceName,
        string macAddress,
        string androidVersion,
        string apiLevel,
        string serialNumber,
        string manufacturer,
        string model,
        string displayResolution,
        string? location = null);
    
    /// <summary>
    /// Create registration record for audit trail
    /// </summary>
    RegistrationRecord CreateRegistrationRecord(
        int deviceId,
        string registrationPin,
        RegistrationAction action,
        int? performedByUserId = null,
        string? notes = null,
        string? ipAddress = null,
        string? userAgent = null);
    
    /// <summary>
    /// Validate device approval/rejection request
    /// </summary>
    (bool isValid, List<string> errors) ValidateApprovalRequest(
        Device device,
        bool approve,
        int performedByUserId,
        string? notes = null);
    
    /// <summary>
    /// Process device approval
    /// </summary>
    Device ApproveDevice(Device device, int approvedByUserId, string? notes = null);
    
    /// <summary>
    /// Process device rejection
    /// </summary>
    Device RejectDevice(Device device, int rejectedByUserId, string reason);
    
    /// <summary>
    /// Check if device is eligible for reactivation
    /// </summary>
    (bool isEligible, List<string> reasons) IsEligibleForReactivation(Device device);
    
    /// <summary>
    /// Reactivate previously deactivated device
    /// </summary>
    Device ReactivateDevice(Device device, int reactivatedByUserId, string? notes = null);
    
    /// <summary>
    /// Deactivate active device
    /// </summary>
    Device DeactivateDevice(Device device, int deactivatedByUserId, string reason);
    
    /// <summary>
    /// Check if MAC address is already registered
    /// </summary>
    bool IsMacAddressRegistered(string macAddress, int? excludeDeviceId = null);
    
    /// <summary>
    /// Check if serial number is already registered
    /// </summary>
    bool IsSerialNumberRegistered(string serialNumber, int? excludeDeviceId = null);
    
    /// <summary>
    /// Generate device key for authentication
    /// </summary>
    string GenerateDeviceKey(string macAddress, string serialNumber);
}

public class DeviceRegistrationService : IDeviceRegistrationService
{
    private const int PIN_LENGTH = 6;
    private const int DEVICE_KEY_LENGTH = 32;
    private readonly Random _random;
    
    // Android API level constraints
    private const int MIN_ANDROID_API_LEVEL = 21; // Android 5.0
    private const int MAX_ANDROID_API_LEVEL = 35; // Current max
    
    // Supported manufacturers
    private static readonly HashSet<string> SUPPORTED_MANUFACTURERS = new()
    {
        "Sony", "TCL", "Hisense", "Philips", "Sharp", "Xiaomi", 
        "Nvidia", "Amazon", "Google", "Samsung", "LG", "Other"
    };

    public DeviceRegistrationService()
    {
        _random = new Random();
    }

    public string GenerateRegistrationPin()
    {
        // Generate 6-digit numeric PIN
        var pin = _random.Next(100000, 999999).ToString();
        return pin;
    }

    public (bool isValid, List<string> errors) ValidateRegistrationRequest(
        string deviceName, 
        string macAddress, 
        string androidVersion, 
        string apiLevel,
        string serialNumber,
        string manufacturer,
        string model)
    {
        var errors = new List<string>();

        // Validate required fields
        if (string.IsNullOrWhiteSpace(deviceName))
            errors.Add("Device name is required");
        else if (deviceName.Length > 200)
            errors.Add("Device name cannot exceed 200 characters");

        // Validate MAC address format
        if (string.IsNullOrWhiteSpace(macAddress))
            errors.Add("MAC address is required");
        else if (!IsValidMacAddress(macAddress))
            errors.Add("Invalid MAC address format");

        // Validate Android version
        if (string.IsNullOrWhiteSpace(androidVersion))
            errors.Add("Android version is required");

        // Validate API level
        if (string.IsNullOrWhiteSpace(apiLevel))
            errors.Add("Android API level is required");
        else if (!int.TryParse(apiLevel, out var level) || level < MIN_ANDROID_API_LEVEL || level > MAX_ANDROID_API_LEVEL)
            errors.Add($"Android API level must be between {MIN_ANDROID_API_LEVEL} and {MAX_ANDROID_API_LEVEL}");

        // Validate serial number
        if (string.IsNullOrWhiteSpace(serialNumber))
            errors.Add("Serial number is required");
        else if (serialNumber.Length > 100)
            errors.Add("Serial number cannot exceed 100 characters");

        // Validate manufacturer
        if (string.IsNullOrWhiteSpace(manufacturer))
            errors.Add("Manufacturer is required");
        else if (!SUPPORTED_MANUFACTURERS.Contains(manufacturer))
            errors.Add($"Unsupported manufacturer. Supported: {string.Join(", ", SUPPORTED_MANUFACTURERS)}");

        // Validate model
        if (string.IsNullOrWhiteSpace(model))
            errors.Add("Model is required");
        else if (model.Length > 100)
            errors.Add("Model cannot exceed 100 characters");

        return (errors.Count == 0, errors);
    }

    public Device CreatePendingDevice(
        string deviceName,
        string macAddress,
        string androidVersion,
        string apiLevel,
        string serialNumber,
        string manufacturer,
        string model,
        string displayResolution,
        string? location = null)
    {
        var deviceKey = GenerateDeviceKey(macAddress, serialNumber);
        
        return new Device
        {
            Name = deviceName,
            DeviceKey = deviceKey,
            Location = location ?? "Unknown",
            Status = DeviceStatus.Pending,
            IpAddress = "0.0.0.0", // Will be updated on first heartbeat
            Resolution = displayResolution ?? "1920x1080",
            IsActive = true,
            
            // Android TV specific fields
            MacAddress = FormatMacAddress(macAddress),
            AndroidVersion = androidVersion,
            ApiLevel = int.TryParse(apiLevel, out var parsedApiLevel) ? parsedApiLevel : null,
            SerialNumber = serialNumber,
            Manufacturer = manufacturer,
            Model = model,
            DisplayResolution = displayResolution ?? "1920x1080",
            
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public RegistrationRecord CreateRegistrationRecord(
        int deviceId,
        string registrationPin,
        RegistrationAction action,
        int? performedByUserId = null,
        string? notes = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        return new RegistrationRecord
        {
            DeviceId = deviceId,
            Action = action,
            UserId = performedByUserId ?? 1, // Default to admin user
            Details = $"PIN: {registrationPin}",
            IpAddress = ipAddress ?? "Unknown",
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow
        };
    }

    public (bool isValid, List<string> errors) ValidateApprovalRequest(
        Device device,
        bool approve,
        int performedByUserId,
        string? notes = null)
    {
        var errors = new List<string>();

        if (device.Status != DeviceStatus.Pending)
            errors.Add("Device is not in pending status");

        if (performedByUserId <= 0)
            errors.Add("Valid user ID is required for approval");

        if (!approve && string.IsNullOrWhiteSpace(notes))
            errors.Add("Rejection reason is required when rejecting device");

        return (errors.Count == 0, errors);
    }

    public Device ApproveDevice(Device device, int approvedByUserId, string? notes = null)
    {
        device.Status = DeviceStatus.Registered;
        device.UpdatedAt = DateTime.UtcNow;
        device.ManagedByUserId = approvedByUserId;
        
        return device;
    }

    public Device RejectDevice(Device device, int rejectedByUserId, string reason)
    {
        device.Status = DeviceStatus.Inactive;
        device.IsActive = false;
        device.UpdatedAt = DateTime.UtcNow;
        device.DeactivatedAt = DateTime.UtcNow;
        device.DeactivatedBy = rejectedByUserId;
        
        return device;
    }

    public (bool isEligible, List<string> reasons) IsEligibleForReactivation(Device device)
    {
        var reasons = new List<string>();

        if (device.Status != DeviceStatus.Inactive)
            reasons.Add("Device is not inactive");

        if (device.IsActive)
            reasons.Add("Device is already active");

        if (device.DeactivatedAt == null)
            reasons.Add("Device has no deactivation record");

        return (reasons.Count == 0, reasons);
    }

    public Device ReactivateDevice(Device device, int reactivatedByUserId, string? notes = null)
    {
        device.Status = DeviceStatus.Registered;
        device.IsActive = true;
        device.UpdatedAt = DateTime.UtcNow;
        device.ManagedByUserId = reactivatedByUserId;
        device.DeactivatedAt = null;
        device.DeactivatedBy = null;
        
        return device;
    }

    public Device DeactivateDevice(Device device, int deactivatedByUserId, string reason)
    {
        device.Status = DeviceStatus.Inactive;
        device.IsActive = false;
        device.UpdatedAt = DateTime.UtcNow;
        device.DeactivatedAt = DateTime.UtcNow;
        device.DeactivatedBy = deactivatedByUserId;
        
        return device;
    }

    public bool IsMacAddressRegistered(string macAddress, int? excludeDeviceId = null)
    {
        // This method should be implemented by the infrastructure layer
        // Domain service defines the contract, implementation is in repository
        throw new NotImplementedException("This method should be implemented by the infrastructure layer");
    }

    public bool IsSerialNumberRegistered(string serialNumber, int? excludeDeviceId = null)
    {
        // This method should be implemented by the infrastructure layer
        // Domain service defines the contract, implementation is in repository
        throw new NotImplementedException("This method should be implemented by the infrastructure layer");
    }

    public string GenerateDeviceKey(string macAddress, string serialNumber)
    {
        // Create a unique device key based on MAC address and serial number
        var combined = $"{FormatMacAddress(macAddress)}-{serialNumber}";
        var hash = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(combined));
        return Convert.ToHexString(hash)[..DEVICE_KEY_LENGTH];
    }

    // Private helper methods
    private static bool IsValidMacAddress(string macAddress)
    {
        if (string.IsNullOrWhiteSpace(macAddress))
            return false;

        // MAC address regex pattern: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
        var pattern = @"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$";
        return System.Text.RegularExpressions.Regex.IsMatch(macAddress, pattern);
    }

    private static string FormatMacAddress(string macAddress)
    {
        // Format MAC address with consistent colon separators and uppercase
        return macAddress.Replace("-", ":").ToUpperInvariant();
    }
}