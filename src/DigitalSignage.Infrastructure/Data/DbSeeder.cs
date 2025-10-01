using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using DigitalSignage.Domain.Entities;

namespace DigitalSignage.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminUserAsync(AppDbContext context)
        {
            if (!await context.Users.AnyAsync(u => u.Username == "admin"))
            {
                var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@localhost",
                    Role = DigitalSignage.Domain.Enums.UserRole.Admin,
                    IsActive = true,
                    CreatedAt = now,
                    UpdatedAt = now,
                    CreatedBy = -1,
                    UpdatedBy = -1,
                    LockoutUntil = now,
                    LastLoginAt = now,
                };
                admin.PasswordHash = HashPassword("P@ssw0rd2025");
                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }
        }

        // Simple SHA256 hash for demonstration (replace with BCrypt for production)
        private static string HashPassword(string password)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
        }
    }
