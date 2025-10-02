using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using Xunit;

namespace DigitalSignage.Api.Tests.Integration;

/// <summary>
/// Integration tests for WebSocket connection lifecycle.
/// These tests MUST FAIL until the NotificationHub is fully implemented.
/// </summary>
public class WebSocketConnectionTests : IAsyncDisposable
{
    private readonly string _hubUrl = "http://localhost:5100/ws";
    private readonly string _validJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    private readonly string _expiredJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.4Adcj0vbY7Y_V_2CkAcQ9rJFh3SLHmN6N1dN_9-xqFU";
    private HubConnection? _connection;

    [Fact]
    public async Task Connection_WithValidJwt_ShouldEstablish()
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

        // Assert
        Assert.Equal(HubConnectionState.Connected, _connection.State);
    }

    [Fact]
    public async Task Connection_WithInvalidJwt_ShouldReject()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult("invalid.jwt.token")!;
            })
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAnyAsync<Exception>(async () =>
            await _connection.StartAsync());

        Assert.NotNull(exception);
    }

    [Fact]
    public async Task Connection_WithExpiredJwt_ShouldReject()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_expiredJwtToken)!;
            })
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAnyAsync<Exception>(async () =>
            await _connection.StartAsync());

        Assert.NotNull(exception);
    }

    [Fact]
    public async Task Connection_WithoutToken_ShouldReject()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl)
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAnyAsync<Exception>(async () =>
            await _connection.StartAsync());

        Assert.NotNull(exception);
    }

    [Fact]
    public async Task Connection_ShouldReceiveWelcomeMessage()
    {
        // Arrange
        var welcomeMessageReceived = false;
        string? receivedConnectionId = null;
        string? receivedUserId = null;

        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        _connection.On<object>("ReceiveEvent", (evt) =>
        {
            dynamic? dynamicEvent = evt;
            if (dynamicEvent?.type == "connection_established")
            {
                welcomeMessageReceived = true;
                receivedConnectionId = dynamicEvent?.payload?.connectionId?.ToString();
                receivedUserId = dynamicEvent?.payload?.userId?.ToString();
            }
        });

        // Act
        await _connection.StartAsync();
        await Task.Delay(2000); // Wait for welcome message

        // Assert
        Assert.True(welcomeMessageReceived, "Should receive connection_established event");
        Assert.NotNull(receivedConnectionId);
        Assert.NotEmpty(receivedConnectionId);
    }

    [Fact]
    public async Task Connection_ShouldReceiveHeartbeatMessages()
    {
        // Arrange
        var heartbeatCount = 0;
        var heartbeatReceived = new TaskCompletionSource<bool>();

        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        _connection.On<object>("ReceiveEvent", (evt) =>
        {
            dynamic? dynamicEvent = evt;
            if (dynamicEvent?.type == "heartbeat")
            {
                heartbeatCount++;
                if (heartbeatCount >= 1)
                {
                    heartbeatReceived.TrySetResult(true);
                }
            }
        });

        // Act
        await _connection.StartAsync();
        
        // Wait for at least one heartbeat (server sends every 15 seconds)
        var receivedHeartbeat = await Task.WhenAny(
            heartbeatReceived.Task,
            Task.Delay(TimeSpan.FromSeconds(20))
        ) == heartbeatReceived.Task;

        // Assert
        Assert.True(receivedHeartbeat, "Should receive at least one heartbeat within 20 seconds");
        Assert.True(heartbeatCount > 0, $"Expected at least 1 heartbeat, received {heartbeatCount}");
    }

    [Fact]
    public async Task Disconnection_ShouldCleanupResources()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        await _connection.StartAsync();
        Assert.Equal(HubConnectionState.Connected, _connection.State);

        // Act
        await _connection.StopAsync();

        // Assert
        Assert.Equal(HubConnectionState.Disconnected, _connection.State);
    }

    [Fact]
    public async Task Connection_ShouldSupportReconnection()
    {
        // Arrange
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .WithAutomaticReconnect()
            .Build();

        // Act - First connection
        await _connection.StartAsync();
        Assert.Equal(HubConnectionState.Connected, _connection.State);

        // Disconnect
        await _connection.StopAsync();
        Assert.Equal(HubConnectionState.Disconnected, _connection.State);

        // Reconnect
        await _connection.StartAsync();

        // Assert
        Assert.Equal(HubConnectionState.Connected, _connection.State);
    }

    [Fact]
    public async Task Connection_ShouldHandleDisconnectGracefully()
    {
        // Arrange
        var disconnected = false;
        
        _connection = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        _connection.Closed += (error) =>
        {
            disconnected = true;
            return Task.CompletedTask;
        };

        // Act
        await _connection.StartAsync();
        await _connection.StopAsync();
        await Task.Delay(500); // Wait for closed event

        // Assert
        Assert.True(disconnected, "Closed event should be triggered");
        Assert.Equal(HubConnectionState.Disconnected, _connection.State);
    }

    [Fact]
    public async Task Connection_ShouldSupportMultipleConcurrentConnections()
    {
        // Arrange
        var connection1 = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        var connection2 = new HubConnectionBuilder()
            .WithUrl(_hubUrl, options =>
            {
                options.AccessTokenProvider = () => Task.FromResult(_validJwtToken)!;
            })
            .Build();

        try
        {
            // Act
            await connection1.StartAsync();
            await connection2.StartAsync();

            // Assert
            Assert.Equal(HubConnectionState.Connected, connection1.State);
            Assert.Equal(HubConnectionState.Connected, connection2.State);
        }
        finally
        {
            // Cleanup
            await connection1.StopAsync();
            await connection2.StopAsync();
            await connection1.DisposeAsync();
            await connection2.DisposeAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_connection != null)
        {
            if (_connection.State == HubConnectionState.Connected)
            {
                await _connection.StopAsync();
            }
            await _connection.DisposeAsync();
        }
    }
}
