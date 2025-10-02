using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Xunit;

namespace DigitalSignage.Api.Tests.Hubs;

/// <summary>
/// Contract tests for NotificationHub to verify SignalR hub methods conform to specifications.
/// These tests MUST FAIL until the NotificationHub is implemented.
/// </summary>
public class NotificationHubContractTests : IAsyncDisposable
{
    private readonly string _hubUrl = "http://localhost:5100/ws";
    private readonly string _validJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    private HubConnection? _connection;

    [Fact]
    public async Task SendHeartbeat_ShouldAcceptValidMessage()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        // Act
        await _connection.StartAsync();
        var exception = await Record.ExceptionAsync(async () =>
            await _connection.InvokeAsync("SendHeartbeat"));

        // Assert
        Assert.Null(exception); // Should not throw
    }

    [Fact]
    public async Task SubscribeToEvents_ShouldAcceptEventTypeList()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        var eventTypes = new List<string> { "device_status_changed", "schedule_updated" };

        // Act
        await _connection.StartAsync();
        var exception = await Record.ExceptionAsync(async () =>
            await _connection.InvokeAsync("SubscribeToEvents", eventTypes));

        // Assert
        Assert.Null(exception); // Should not throw
    }

    [Fact]
    public async Task UnsubscribeFromEvents_ShouldAcceptEventTypeList()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        var eventTypes = new List<string> { "device_status_changed", "schedule_updated" };

        // Act
        await _connection.StartAsync();
        var exception = await Record.ExceptionAsync(async () =>
            await _connection.InvokeAsync("UnsubscribeFromEvents", eventTypes));

        // Assert
        Assert.Null(exception); // Should not throw
    }

    [Fact]
    public async Task AcknowledgeEvent_ShouldAcceptEventId()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        var eventId = "evt-123-abc";

        // Act
        await _connection.StartAsync();
        var exception = await Record.ExceptionAsync(async () =>
            await _connection.InvokeAsync("AcknowledgeEvent", eventId));

        // Assert
        Assert.Null(exception); // Should not throw
    }

    [Fact]
    public async Task Hub_ShouldRequireAuthentication()
    {
        // Arrange - connection without JWT token
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl)
            .Build();

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(async () =>
            await _connection.StartAsync());
    }

    [Fact]
    public async Task Hub_ShouldRejectInvalidToken()
    {
        // Arrange - connection with invalid token
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult("invalid.token.here")!;
            })
            .Build();

        // Act & Assert
        await Assert.ThrowsAnyAsync<Exception>(async () =>
            await _connection.StartAsync());
    }

    [Fact]
    public async Task Connection_ShouldReceiveWelcomeMessage()
    {
        // Arrange
        var welcomeReceived = false;
        string? connectionId = null;

        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        _connection.On<object>("ReceiveEvent", (evt) =>
        {
            dynamic? dynamicEvent = evt;
            if (dynamicEvent?.Type == "connection_established")
            {
                welcomeReceived = true;
                connectionId = dynamicEvent?.Payload?.connectionId;
            }
        });

        // Act
        await _connection.StartAsync();
        await Task.Delay(1000); // Wait for welcome message

        // Assert
        Assert.True(welcomeReceived, "Welcome message should be received after connection");
        Assert.NotNull(connectionId);
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection != null)
        {
            await _connection.StopAsync();
            await _connection.DisposeAsync();
        }
    }
}
