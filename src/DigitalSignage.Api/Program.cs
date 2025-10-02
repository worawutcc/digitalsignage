using DigitalSignage.Api.Extensions;
using DigitalSignage.Api.Middleware;
using DigitalSignage.Api;
using log4net;
using log4net.Config;

// Configure log4net
var logRepository = LogManager.GetRepository(System.Reflection.Assembly.GetEntryAssembly() ?? System.Reflection.Assembly.GetExecutingAssembly());
XmlConfigurator.Configure(logRepository, new FileInfo("log4net.config"));

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel server options - support environment variable override
var serverUrl = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") 
    ?? builder.Configuration["Kestrel:Endpoints:Http:Url"]
    ?? "http://localhost:5100";

if (!string.IsNullOrEmpty(serverUrl))
{
    builder.WebHost.UseUrls(serverUrl);
}

// Add services to the container using extension methods
builder.Services
    .AddConfigurationServices(builder.Configuration)
    .AddMvcServices()
    .AddDatabaseServices(builder.Configuration)
    .AddAwsServices(builder.Configuration)
    .AddApplicationServices()
    .AddPermissionServices()
    .AddJwtAuthentication(builder.Configuration)
    .AddHealthCheckServices()
    .AddApiDocumentation()
    .AddCorsServices()
    .AddSignalRServices();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Configure CORS
app.UseCors();

// Configure Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Map SignalR hubs
app.MapSignalRHubs();

// Map health checks
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false,
    ResponseWriter = HealthCheckResponseWriter.WriteResponse
});

// Test database connection on startup
if (app.Environment.IsDevelopment())
{
    Console.WriteLine("\n🔍 Testing database connection...");
    await DatabaseConnectionTest.TestConnection();
    Console.WriteLine();
}

// Seed admin user on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DigitalSignage.Infrastructure.Data.AppDbContext>();
    await DigitalSignage.Infrastructure.Data.DbSeeder.SeedAdminUserAsync(db);
}

app.Run();

// Make the implicit Program class public for testing
public partial class Program { }
