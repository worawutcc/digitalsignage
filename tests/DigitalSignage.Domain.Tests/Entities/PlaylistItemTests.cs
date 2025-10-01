using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class PlaylistItemTests
{
    [Fact]
    public void PlaylistItem_Should_Have_Required_Properties()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem
        {
            PlaylistId = 1,
            MediaId = 2,
            OrderIndex = 1,
            DurationSeconds = 30
        };

        // Assert
        Assert.Equal(1, playlistItem.PlaylistId);
        Assert.Equal(2, playlistItem.MediaId);
        Assert.Equal(1, playlistItem.OrderIndex);
        Assert.Equal(30, playlistItem.DurationSeconds);
    }

    [Fact]
    public void PlaylistItem_Should_Have_Default_Transition_Effect()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem();

        // Assert
        Assert.Equal(TransitionEffect.Cut, playlistItem.TransitionEffect);
    }

    [Fact]
    public void PlaylistItem_Should_Allow_Custom_Duration()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem
        {
            MediaId = 1,
            DurationSeconds = 45,
            UseCustomDuration = true
        };

        // Assert
        Assert.Equal(45, playlistItem.DurationSeconds);
        Assert.True(playlistItem.UseCustomDuration);
    }

    [Fact]
    public void PlaylistItem_Should_Support_Conditional_Display()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem
        {
            MediaId = 1,
            IsConditional = true,
            StartTime = TimeOnly.FromDateTime(DateTime.Today.AddHours(9)),
            EndTime = TimeOnly.FromDateTime(DateTime.Today.AddHours(17))
        };

        // Assert
        Assert.True(playlistItem.IsConditional);
        Assert.NotNull(playlistItem.StartTime);
        Assert.NotNull(playlistItem.EndTime);
    }

    [Fact]
    public void PlaylistItem_Should_Have_Navigation_Properties()
    {
        // Arrange & Act
        var playlist = new Playlist { Id = 1, Name = "Test Playlist" };
        var media = new Media { Id = 2, Name = "Test Media" };
        var playlistItem = new PlaylistItem
        {
            PlaylistId = 1,
            MediaId = 2,
            Playlist = playlist,
            Media = media
        };

        // Assert
        Assert.NotNull(playlistItem.Playlist);
        Assert.NotNull(playlistItem.Media);
        Assert.Equal(playlist, playlistItem.Playlist);
        Assert.Equal(media, playlistItem.Media);
    }

    [Fact]
    public void PlaylistItem_Should_Support_Transition_Effects()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem
        {
            MediaId = 1,
            TransitionEffect = TransitionEffect.Fade,
            TransitionDurationMs = 1000
        };

        // Assert
        Assert.Equal(TransitionEffect.Fade, playlistItem.TransitionEffect);
        Assert.Equal(1000, playlistItem.TransitionDurationMs);
    }

    [Fact]
    public void PlaylistItem_Should_Validate_Order_Index()
    {
        // Arrange & Act
        var playlistItem = new PlaylistItem
        {
            OrderIndex = 5
        };

        // Assert
        Assert.True(playlistItem.OrderIndex > 0);
        Assert.Equal(5, playlistItem.OrderIndex);
    }
}