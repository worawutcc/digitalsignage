using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;
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
                var now = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day,
                                      DateTime.Now.Hour, DateTime.Now.Minute, DateTime.Now.Second);
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
    }
}
