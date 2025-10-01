using Microsoft.EntityFrameworkCore;
using DigitalSignage.Infrastructure.Data;
using Microsoft.Extensions.Configuration;

namespace DigitalSignage.Api;

public class DatabaseConnectionTest
{
    public static async Task TestConnection()
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        try
        {
            using var context = new AppDbContext(options);
            
            // Test connection
            await context.Database.CanConnectAsync();
            Console.WriteLine("✅ Database connection successful!");
            Console.WriteLine($"Connection: {connectionString}");
            
            // Check existing tables
            var tableQuery = @"
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;";
            
            var tables = await context.Database.SqlQueryRaw<string>(tableQuery).ToListAsync();
            
            Console.WriteLine("\n📋 Existing tables:");
            foreach (var table in tables)
            {
                Console.WriteLine($"  - {table}");
            }
            
            // Check migration history
            var migrationQuery = @"
                SELECT ""MigrationId"" 
                FROM ""__EFMigrationsHistory"" 
                ORDER BY ""MigrationId"";";
            
            try
            {
                var migrations = await context.Database.SqlQueryRaw<string>(migrationQuery).ToListAsync();
                Console.WriteLine("\n🔄 Applied migrations:");
                foreach (var migration in migrations)
                {
                    Console.WriteLine($"  - {migration}");
                }
            }
            catch
            {
                Console.WriteLine("\n⚠️  Migration history table not found");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Database connection failed: {ex.Message}");
        }
    }
}