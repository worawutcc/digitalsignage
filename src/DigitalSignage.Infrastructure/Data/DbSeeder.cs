using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using DigitalSignage.Application.Interfaces;

namespace DigitalSignage.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminUserAsync(AppDbContext context, IPasswordHashService passwordHashService)
        {
            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            
            if (existingAdmin == null)
            {
                var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@gmail.com",
                    Role = DigitalSignage.Domain.Enums.UserRole.Admin,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = -1,
                    UpdatedBy = -1,
                    LockoutUntil = null, // Admin account should not be locked
                    LastLoginAt = null, // Set to null initially, will be updated on first login
                };
                admin.PasswordHash = passwordHashService.HashPassword("P@ssw0rd2025");
                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }
            else
            {
                // Update existing admin user to ensure it's not locked
                if (existingAdmin.LockoutUntil.HasValue)
                {
                    existingAdmin.LockoutUntil = null;
                    existingAdmin.FailedLoginAttempts = 0;
                    var updateTime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day,
                                                 DateTime.Now.Hour, DateTime.Now.Minute, DateTime.Now.Second);
                    existingAdmin.UpdatedAt = updateTime;
                    await context.SaveChangesAsync();
                }
            }
        }

        /// <summary>
        /// Seed sample devices for development and testing
        /// Following API copilot instructions for proper entity seeding
        /// </summary>
        public static async Task SeedDevicesAsync(AppDbContext context)
        {
            // Check if devices already exist
            if (await context.Devices.AnyAsync())
            {
                return; // Skip seeding if devices already exist
            }

            var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
            // Get admin user for device ownership
            var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (adminUser == null)
            {
                throw new InvalidOperationException("Admin user must be seeded before devices");
            }

            // Seed default device group if not exists
            var defaultGroup = await context.DeviceGroups.FirstOrDefaultAsync(g => g.Name == "Default Group");
            if (defaultGroup == null)
            {
                defaultGroup = new DeviceGroup
                {
                    Name = "Default Group",
                    Description = "Default device group for ungrouped devices",
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                };
                context.DeviceGroups.Add(defaultGroup);
                await context.SaveChangesAsync();
            }

            // Seed sample devices
            var devices = new[]
            {
                new Device
                {
                    Name = "Reception Display",
                    DeviceKey = "DEVICE_REC_001",
                    DeviceType = DeviceType.AndroidTV,
                    MacAddress = "00:1A:2B:3C:4D:01",
                    Location = "Reception Area - Main Floor",
                    Resolution = "1920x1080",
                    Status = DeviceStatus.Online,
                    IsActive = true,
                    LastHeartbeat = now.AddMinutes(-2), // Recent heartbeat
                    ManagedByUserId = adminUser.Id,
                    DeviceGroupId = defaultGroup.Id,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                },
                new Device
                {
                    Name = "Lobby Display",
                    DeviceKey = "DEVICE_LOB_002",
                    DeviceType = DeviceType.AndroidTV,
                    MacAddress = "00:1A:2B:3C:4D:02",
                    Location = "Lobby - Ground Floor",
                    Resolution = "3840x2160",
                    Status = DeviceStatus.Online,
                    IsActive = true,
                    LastHeartbeat = now.AddMinutes(-1), // Very recent heartbeat
                    ManagedByUserId = adminUser.Id,
                    DeviceGroupId = defaultGroup.Id,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                },
                new Device
                {
                    Name = "Conference Room A",
                    DeviceKey = "DEVICE_CONF_A_003",
                    DeviceType = DeviceType.AndroidTV,
                    MacAddress = "00:1A:2B:3C:4D:03",
                    Location = "Conference Room A - 2nd Floor",
                    Resolution = "1920x1080",
                    Status = DeviceStatus.Offline,
                    IsActive = true,
                    LastHeartbeat = now.AddMinutes(-10), // Old heartbeat (offline)
                    ManagedByUserId = adminUser.Id,
                    DeviceGroupId = defaultGroup.Id,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                },
                new Device
                {
                    Name = "Cafeteria Display",
                    DeviceKey = "DEVICE_CAF_004",
                    DeviceType = DeviceType.AndroidTV,
                    MacAddress = "00:1A:2B:3C:4D:04",
                    Location = "Cafeteria - Main Floor",
                    Resolution = "1920x1080",
                    Status = DeviceStatus.Online,
                    IsActive = true,
                    LastHeartbeat = now.AddMinutes(-3), // Recent heartbeat
                    ManagedByUserId = adminUser.Id,
                    DeviceGroupId = defaultGroup.Id,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                },
                new Device
                {
                    Name = "Emergency Exit Display",
                    DeviceKey = "DEVICE_EXIT_005",
                    DeviceType = DeviceType.AndroidTV,
                    MacAddress = "00:1A:2B:3C:4D:05",
                    Location = "Emergency Exit - All Floors",
                    Resolution = "1366x768",
                    Status = DeviceStatus.Maintenance,
                    IsActive = false, // Inactive for maintenance
                    LastHeartbeat = now.AddHours(-2), // Very old heartbeat
                    ManagedByUserId = adminUser.Id,
                    DeviceGroupId = defaultGroup.Id,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = adminUser.Id,
                    UpdatedBy = adminUser.Id
                }
            };

            context.Devices.AddRange(devices);
            await context.SaveChangesAsync();

            // Seed device status logs for history
            await SeedDeviceStatusLogsAsync(context, devices, adminUser.Id);
        }

        /// <summary>
        /// Seed device status logs for sample data
        /// </summary>
        private static async Task SeedDeviceStatusLogsAsync(AppDbContext context, Device[] devices, int userId)
        {
            var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
            var statusLogs = new List<DeviceStatusLog>();

            foreach (var device in devices)
            {
                // Create some historical status changes
                var weekAgo = DateTime.SpecifyKind(now.AddDays(-7), DateTimeKind.Unspecified);
                var thirtyMinutesAgo = DateTime.SpecifyKind(now.AddMinutes(-30), DateTimeKind.Unspecified);
                var fifteenMinutesAgo = DateTime.SpecifyKind(now.AddMinutes(-15), DateTimeKind.Unspecified);

                var logEntries = new[]
                {
                    new DeviceStatusLog
                    {
                        DeviceId = device.Id,
                        Status = DeviceStatus.Online,
                        Details = $"{{\"previousStatus\":\"Offline\",\"reason\":\"Device initialization and first boot\"}}",
                        Source = "system",
                        Timestamp = weekAgo,
                        CreatedAt = weekAgo,
                        UpdatedAt = weekAgo,
                        CreatedBy = userId,
                        UpdatedBy = userId
                    },
                    new DeviceStatusLog
                    {
                        DeviceId = device.Id,
                        Status = device.Status,
                        Details = device.Status == DeviceStatus.Offline ? 
                            $"{{\"previousStatus\":\"Online\",\"reason\":\"Heartbeat timeout - device went offline\"}}" :
                            device.Status == DeviceStatus.Maintenance ? 
                            $"{{\"previousStatus\":\"Online\",\"reason\":\"Scheduled maintenance mode\"}}" :
                            $"{{\"previousStatus\":\"Online\",\"reason\":\"Device status update\"}}",
                        Source = device.Status == DeviceStatus.Offline ? "heartbeat" : "manual",
                        Timestamp = device.Status == DeviceStatus.Online ? thirtyMinutesAgo : fifteenMinutesAgo,
                        CreatedAt = device.Status == DeviceStatus.Online ? thirtyMinutesAgo : fifteenMinutesAgo,
                        UpdatedAt = device.Status == DeviceStatus.Online ? thirtyMinutesAgo : fifteenMinutesAgo,
                        CreatedBy = userId,
                        UpdatedBy = userId
                    }
                };

                statusLogs.AddRange(logEntries);
            }

            context.DeviceStatusLogs.AddRange(statusLogs);
            await context.SaveChangesAsync();
        }

        /// <summary>
        /// Seed all development data
        /// </summary>
        public static async Task SeedAllAsync(AppDbContext context, IPasswordHashService passwordHashService)
        {
            await SeedAdminUserAsync(context, passwordHashService);
            await SeedDevicesAsync(context);
        }
    }
}
