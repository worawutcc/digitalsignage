using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace DigitalSignage.Infrastructure.Data;

public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../DigitalSignage.Api"))
            .AddJsonFile("appsettings.json")
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        
        var databaseProvider = configuration["DatabaseProvider"] ?? "PostgreSQL";
        var connectionString = databaseProvider switch
        {
            "SqlServer" => configuration.GetConnectionString("SqlServerConnection"),
            _ => configuration.GetConnectionString("DefaultConnection")
        };

        if (databaseProvider == "SqlServer")
        {
            optionsBuilder.UseSqlServer(connectionString);
        }
        else
        {
            optionsBuilder.UseNpgsql(connectionString);
        }

        return new AppDbContext(optionsBuilder.Options);
    }
}