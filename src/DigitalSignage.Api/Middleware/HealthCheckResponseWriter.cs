using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

namespace DigitalSignage.Api.Middleware;

public static class HealthCheckResponseWriter
{
    public static Task WriteResponse(HttpContext context, HealthReport result)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var response = new
        {
            status = result.Status.ToString(),
            totalDuration = result.TotalDuration.ToString(),
            checks = result.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString(),
                description = entry.Value.Description,
                duration = entry.Value.Duration.ToString(),
                exception = entry.Value.Exception?.Message,
                data = entry.Value.Data
            })
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        }));
    }
}