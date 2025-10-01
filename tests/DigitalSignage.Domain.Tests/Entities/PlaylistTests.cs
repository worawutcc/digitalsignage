using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class PlaylistTests
{
    [Fact]
    public void Playlist_Should_Have_Valid_Name()
    {
        // Arrange & Act
        var playlist = new Playlist
        {
            Name = "Test Playlist",
            Description = "Test Description",
            Status = PlaylistStatus.Draft
        };

        // Assert
        Assert.NotNull(playlist.Name);
        Assert.NotEmpty(playlist.Name);
        Assert.Equal("Test Playlist", playlist.Name);
    }

    [Fact]
    public void Playlist_Should_Have_Default_Status_Draft()
    {
        // Arrange & Act
        var playlist = new Playlist();

        // Assert
        Assert.Equal(PlaylistStatus.Draft, playlist.Status);
    }

    [Fact]
    public void Playlist_Should_Initialize_Empty_PlaylistItems_Collection()
    {
        // Arrange & Act
        var playlist = new Playlist();

        // Assert
        Assert.NotNull(playlist.PlaylistItems);
        Assert.Empty(playlist.PlaylistItems);
    }

    [Fact]
    public void Playlist_Should_Allow_Adding_PlaylistItems()
    {
        // Arrange
        var playlist = new Playlist { Name = "Test Playlist" };
        var playlistItem = new PlaylistItem 
        { 
            MediaId = 1, 
            OrderIndex = 1, 
            DurationSeconds = 30 
        };

        // Act
        playlist.PlaylistItems.Add(playlistItem);

        // Assert
        Assert.Single(playlist.PlaylistItems);
        Assert.Contains(playlistItem, playlist.PlaylistItems);
    }

    [Fact]
    public void Playlist_Should_Have_Loop_Setting()
    {
        // Arrange & Act
        var playlist = new Playlist
        {
            Name = "Test Playlist",
            IsLooped = true,
            LoopCount = 5
        };

        // Assert
        Assert.True(playlist.IsLooped);
        Assert.Equal(5, playlist.LoopCount);
    }

    [Fact]
    public void Playlist_Should_Track_Created_And_Updated_Dates()
    {
        // Arrange
        var now = DateTime.UtcNow;
        
        // Act
        var playlist = new Playlist
        {
            Name = "Test Playlist",
            CreatedAt = now,
            UpdatedAt = now
        };

        // Assert
        Assert.Equal(now, playlist.CreatedAt);
        Assert.Equal(now, playlist.UpdatedAt);
    }

    [Fact]
    public void Playlist_Should_Allow_Setting_Priority()
    {
        // Arrange & Act
        var playlist = new Playlist
        {
            Name = "High Priority Playlist",
            Priority = 10
        };

        // Assert
        Assert.Equal(10, playlist.Priority);
    }
}