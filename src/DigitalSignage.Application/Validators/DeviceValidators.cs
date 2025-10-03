using FluentValidation;
using DigitalSignage.Application.DTOs.Device;
using DigitalSignage.Domain.Enums;
using System.Text.RegularExpressions;

namespace DigitalSignage.Application.Validators;

/// <summary>
/// Validator for device registration requests
/// </summary>
public class DeviceRegistrationDtoValidator : AbstractValidator<DeviceRegistrationDto>
{
    public DeviceRegistrationDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Device name is required")
            .Length(1, 100)
            .WithMessage("Device name must be between 1 and 100 characters");

        RuleFor(x => x.MacAddress)
            .NotEmpty()
            .WithMessage("MAC address is required")
            .Matches(@"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$")
            .WithMessage("MAC address must be in valid format (e.g., 00:11:22:33:44:55)");

        RuleFor(x => x.IpAddress)
            .Matches(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
            .WithMessage("IP address must be in valid IPv4 format")
            .When(x => !string.IsNullOrEmpty(x.IpAddress));

        RuleFor(x => x.AndroidVersion)
            .MaximumLength(20)
            .WithMessage("Android version must not exceed 20 characters")
            .When(x => !string.IsNullOrEmpty(x.AndroidVersion));

        RuleFor(x => x.ApiLevel)
            .GreaterThan(0)
            .WithMessage("API level must be greater than 0")
            .LessThanOrEqualTo(50)
            .WithMessage("API level must be reasonable (≤50)")
            .When(x => x.ApiLevel.HasValue);

        RuleFor(x => x.SerialNumber)
            .MaximumLength(50)
            .WithMessage("Serial number must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.SerialNumber));

        RuleFor(x => x.Manufacturer)
            .MaximumLength(50)
            .WithMessage("Manufacturer must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Manufacturer));

        RuleFor(x => x.Model)
            .MaximumLength(50)
            .WithMessage("Model must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Model));

        RuleFor(x => x.DisplayResolution)
            .Matches(@"^\d{3,4}x\d{3,4}$")
            .WithMessage("Display resolution must be in format like '1920x1080'")
            .When(x => !string.IsNullOrEmpty(x.DisplayResolution));

        RuleFor(x => x.Location)
            .MaximumLength(200)
            .WithMessage("Location must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Location));

        RuleFor(x => x.DeviceGroupId)
            .GreaterThan(0)
            .WithMessage("Device group ID must be greater than 0")
            .When(x => x.DeviceGroupId.HasValue);
    }
}

/// <summary>
/// Validator for device update requests
/// </summary>
public class DeviceUpdateDtoValidator : AbstractValidator<DeviceUpdateDto>
{
    public DeviceUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
            .Length(1, 100)
            .WithMessage("Device name must be between 1 and 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.IpAddress)
            .Matches(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$")
            .WithMessage("IP address must be in valid IPv4 format")
            .When(x => !string.IsNullOrEmpty(x.IpAddress));

        RuleFor(x => x.AndroidVersion)
            .MaximumLength(20)
            .WithMessage("Android version must not exceed 20 characters")
            .When(x => !string.IsNullOrEmpty(x.AndroidVersion));

        RuleFor(x => x.ApiLevel)
            .GreaterThan(0)
            .WithMessage("API level must be greater than 0")
            .LessThanOrEqualTo(50)
            .WithMessage("API level must be reasonable (≤50)")
            .When(x => x.ApiLevel.HasValue);

        RuleFor(x => x.SerialNumber)
            .MaximumLength(50)
            .WithMessage("Serial number must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.SerialNumber));

        RuleFor(x => x.Manufacturer)
            .MaximumLength(50)
            .WithMessage("Manufacturer must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Manufacturer));

        RuleFor(x => x.Model)
            .MaximumLength(50)
            .WithMessage("Model must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Model));

        RuleFor(x => x.DisplayResolution)
            .Matches(@"^\d{3,4}x\d{3,4}$")
            .WithMessage("Display resolution must be in format like '1920x1080'")
            .When(x => !string.IsNullOrEmpty(x.DisplayResolution));

        RuleFor(x => x.Location)
            .MaximumLength(200)
            .WithMessage("Location must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Location));

        RuleFor(x => x.DeviceGroupId)
            .GreaterThan(0)
            .WithMessage("Device group ID must be greater than 0")
            .When(x => x.DeviceGroupId.HasValue);

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid device status")
            .When(x => x.Status.HasValue);
    }
}

/// <summary>
/// Validator for device filter requests
/// </summary>
public class DeviceFilterDtoValidator : AbstractValidator<DeviceFilterDto>
{
    public DeviceFilterDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithMessage("Page number must be at least 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithMessage("Page size must be between 1 and 100");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(100)
            .WithMessage("Search term must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.SearchTerm));

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid device status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.Location)
            .MaximumLength(200)
            .WithMessage("Location must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Location));

        RuleFor(x => x.Manufacturer)
            .MaximumLength(50)
            .WithMessage("Manufacturer must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Manufacturer));

        RuleFor(x => x.RegisteredAfter)
            .LessThan(DateTime.UtcNow)
            .WithMessage("RegisteredAfter must be in the past")
            .When(x => x.RegisteredAfter.HasValue);

        RuleFor(x => x.RegisteredBefore)
            .LessThan(DateTime.UtcNow)
            .WithMessage("RegisteredBefore must be in the past")
            .When(x => x.RegisteredBefore.HasValue);

        RuleFor(x => x)
            .Must(x => !x.RegisteredAfter.HasValue || !x.RegisteredBefore.HasValue || x.RegisteredAfter <= x.RegisteredBefore)
            .WithMessage("RegisteredAfter must be before or equal to RegisteredBefore")
            .When(x => x.RegisteredAfter.HasValue && x.RegisteredBefore.HasValue);
    }
}

/// <summary>
/// Validator for device configuration update requests
/// </summary>
public class DeviceConfigurationUpdateDtoValidator : AbstractValidator<DeviceConfigurationUpdateDto>
{
    public DeviceConfigurationUpdateDtoValidator()
    {
        RuleFor(x => x.DisplayOrientation)
            .IsInEnum()
            .WithMessage("Display orientation must be a valid value")
            .When(x => x.DisplayOrientation.HasValue);

        RuleFor(x => x.Resolution)
            .Matches(@"^\d{3,4}x\d{3,4}$")
            .WithMessage("Resolution must be in format like '1920x1080'")
            .When(x => !string.IsNullOrEmpty(x.Resolution));

        RuleFor(x => x.RefreshRate)
            .InclusiveBetween(30, 240)
            .WithMessage("Refresh rate must be between 30 and 240 Hz")
            .When(x => x.RefreshRate.HasValue);

        RuleFor(x => x.ScreenTimeout)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Screen timeout must be 0 or greater (0 = never timeout)")
            .LessThanOrEqualTo(86400)
            .WithMessage("Screen timeout must not exceed 24 hours (86400 seconds)")
            .When(x => x.ScreenTimeout.HasValue);

        RuleFor(x => x.PowerManagement)
            .IsInEnum()
            .WithMessage("Power management must be a valid value")
            .When(x => x.PowerManagement.HasValue);

        RuleFor(x => x.NetworkConfig)
            .Must(BeValidJson)
            .WithMessage("Network configuration must be valid JSON")
            .When(x => !string.IsNullOrEmpty(x.NetworkConfig));

        RuleFor(x => x.AppPermissions)
            .Must(BeValidJson)
            .WithMessage("App permissions must be valid JSON")
            .When(x => !string.IsNullOrEmpty(x.AppPermissions));

        RuleFor(x => x.ProxySettings)
            .Must(BeValidJson)
            .WithMessage("Proxy settings must be valid JSON")
            .When(x => !string.IsNullOrEmpty(x.ProxySettings));
    }

    private static bool BeValidJson(string? json)
    {
        if (string.IsNullOrEmpty(json))
            return true;

        try
        {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }
}