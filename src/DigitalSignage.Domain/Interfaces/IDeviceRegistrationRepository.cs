using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Interfaces;

/// <summary>
/// Repository interface for device registration data access operations
/// </summary>
public interface IDeviceRegistrationRepository
{
    // Basic CRUD operations
    Task<DeviceRegistrationRequest?> GetByIdAsync(Guid id);
    Task<DeviceRegistrationRequest?> GetByMacAddressAsync(string macAddress);
    Task<DeviceRegistrationRequest?> GetByPinAsync(string pin);
    Task<DeviceRegistrationRequest> AddAsync(DeviceRegistrationRequest registration);
    Task<DeviceRegistrationRequest> UpdateAsync(DeviceRegistrationRequest registration);
    Task DeleteAsync(Guid id);

    // Query operations
    Task<List<DeviceRegistrationRequest>> GetPendingRegistrationsAsync();
    Task<List<DeviceRegistrationRequest>> GetExpiredRegistrationsAsync();
    Task<List<DeviceRegistrationRequest>> GetRegistrationsByStatusAsync(RegistrationStatus status);
    Task<List<DeviceRegistrationRequest>> GetRegistrationsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<List<DeviceRegistrationRequest>> SearchRegistrationsAsync(
        string? searchTerm = null,
        RegistrationStatus? status = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        int skip = 0,
        int take = 50);

    // Validation operations
    Task<bool> IsPinUniqueAsync(string pin);
    Task<bool> IsDeviceRegisteredAsync(string macAddress);

    // Statistics and maintenance
    Task<int> CountByStatusAsync(RegistrationStatus status);
    Task<Dictionary<RegistrationStatus, int>> GetRegistrationStatsAsync();
    Task MarkExpiredRegistrationsAsync();
    Task BulkUpdateStatusAsync(List<Guid> registrationIds, RegistrationStatus newStatus);

    // Audit log operations
    Task<RegistrationAuditLog> AddAuditLogAsync(RegistrationAuditLog auditLog);
    Task<List<RegistrationAuditLog>> GetAuditLogsAsync(Guid registrationId);
    Task<List<RegistrationAuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<List<RegistrationAuditLog>> GetAuditLogsByActionAsync(AuditAction action);
    Task<List<RegistrationAuditLog>> GetAuditLogsByMacAddressAsync(string macAddress);
    Task CleanupOldAuditLogsAsync(DateTime beforeDate);
}