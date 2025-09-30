using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class PlaybackStateTests
{
    [Fact]
    public void PlaybackState_Should_Have_Required_Properties()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 2,
            CurrentItemIndex = 3,
            Status = PlaybackStatus.Playing,
            StartedAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(1, playbackState.DeviceId);
        Assert.Equal(2, playbackState.PlaylistId);
        Assert.Equal(3, playbackState.CurrentItemIndex);
        Assert.Equal(PlaybackStatus.Playing, playbackState.Status);
        Assert.NotEqual(default(DateTime), playbackState.StartedAt);
    }

    [Fact]
    public void PlaybackState_Should_Have_Navigation_Properties()
    {
        // Arrange & Act
        var device = new Device { Id = 1, Name = "Test Device" };
        var playlist = new Playlist { Id = 2, Name = "Test Playlist" };
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 2,
            Device = device,
            Playlist = playlist
        };

        // Assert
        Assert.NotNull(playbackState.Device);
        Assert.NotNull(playbackState.Playlist);
        Assert.Equal(device, playbackState.Device);
        Assert.Equal(playlist, playbackState.Playlist);
    }

    [Fact]
    public void PlaybackState_Should_Track_Current_Position()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            CurrentItemIndex = 5,
            CurrentPositionSeconds = 45,
            TotalDurationSeconds = 120
        };

        // Assert
        Assert.Equal(5, playbackState.CurrentItemIndex);
        Assert.Equal(45, playbackState.CurrentPositionSeconds);
        Assert.Equal(120, playbackState.TotalDurationSeconds);
    }

    [Fact]
    public void PlaybackState_Should_Handle_Different_Statuses()
    {
        // Arrange & Act
        var playingState = new PlaybackState { Status = PlaybackStatus.Playing };
        var pausedState = new PlaybackState { Status = PlaybackStatus.Paused };
        var stoppedState = new PlaybackState { Status = PlaybackStatus.Stopped };
        var bufferingState = new PlaybackState { Status = PlaybackStatus.Buffering };
        var errorState = new PlaybackState { Status = PlaybackStatus.Error };

        // Assert
        Assert.Equal(PlaybackStatus.Playing, playingState.Status);
        Assert.Equal(PlaybackStatus.Paused, pausedState.Status);
        Assert.Equal(PlaybackStatus.Stopped, stoppedState.Status);
        Assert.Equal(PlaybackStatus.Buffering, bufferingState.Status);
        Assert.Equal(PlaybackStatus.Error, errorState.Status);
    }

    [Fact]
    public void PlaybackState_Should_Track_Loop_Information()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            CurrentLoopCount = 2,
            TotalLoops = 5,
            IsLooping = true
        };

        // Assert
        Assert.Equal(2, playbackState.CurrentLoopCount);
        Assert.Equal(5, playbackState.TotalLoops);
        Assert.True(playbackState.IsLooping);
    }

    [Fact]
    public void PlaybackState_Should_Track_Timing_Information()
    {
        // Arrange
        var startTime = DateTime.UtcNow;
        var lastUpdate = startTime.AddMinutes(5);

        // Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            StartedAt = startTime,
            LastUpdatedAt = lastUpdate,
            EstimatedEndAt = startTime.AddHours(2)
        };

        // Assert
        Assert.Equal(startTime, playbackState.StartedAt);
        Assert.Equal(lastUpdate, playbackState.LastUpdatedAt);
        Assert.Equal(startTime.AddHours(2), playbackState.EstimatedEndAt);
    }

    [Fact]
    public void PlaybackState_Should_Handle_Error_Information()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            Status = PlaybackStatus.Error,
            ErrorMessage = "Media file not found",
            ErrorOccurredAt = DateTime.UtcNow
        };

        // Assert
        Assert.Equal(PlaybackStatus.Error, playbackState.Status);
        Assert.Equal("Media file not found", playbackState.ErrorMessage);
        Assert.NotNull(playbackState.ErrorOccurredAt);
    }

    [Fact]
    public void PlaybackState_Should_Track_Synchronization()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            IsSynced = true,
            LastSyncAt = DateTime.UtcNow,
            SyncToken = "sync-token-123"
        };

        // Assert
        Assert.True(playbackState.IsSynced);
        Assert.NotNull(playbackState.LastSyncAt);
        Assert.Equal("sync-token-123", playbackState.SyncToken);
    }

    [Fact]
    public void PlaybackState_Should_Calculate_Progress_Percentage()
    {
        // Arrange & Act
        var playbackState = new PlaybackState
        {
            DeviceId = 1,
            PlaylistId = 1,
            CurrentPositionSeconds = 30,
            TotalDurationSeconds = 120
        };

        // Calculate progress percentage
        var progressPercentage = playbackState.TotalDurationSeconds > 0 
            ? (double)playbackState.CurrentPositionSeconds / playbackState.TotalDurationSeconds * 100 
            : 0;

        // Assert
        Assert.Equal(25.0, progressPercentage); // 30/120 * 100 = 25%
    }
}