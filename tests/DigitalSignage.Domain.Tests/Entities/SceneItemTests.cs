using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class SceneItemTests
{
    [Fact]
    public void SceneItem_Should_Have_Required_Properties()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            SceneId = 1,
            MediaId = 2,
            X = 100,
            Y = 200,
            Width = 800,
            Height = 600,
            ZIndex = 1
        };

        // Assert
        Assert.Equal(1, sceneItem.SceneId);
        Assert.Equal(2, sceneItem.MediaId);
        Assert.Equal(100, sceneItem.X);
        Assert.Equal(200, sceneItem.Y);
        Assert.Equal(800, sceneItem.Width);
        Assert.Equal(600, sceneItem.Height);
        Assert.Equal(1, sceneItem.ZIndex);
    }

    [Fact]
    public void SceneItem_Should_Have_Navigation_Properties()
    {
        // Arrange & Act
        var scene = new Scene { Id = 1, Name = "Test Scene" };
        var media = new Media { Id = 2, Name = "Test Media" };
        var sceneItem = new SceneItem
        {
            SceneId = 1,
            MediaId = 2,
            Scene = scene,
            Media = media
        };

        // Assert
        Assert.NotNull(sceneItem.Scene);
        Assert.NotNull(sceneItem.Media);
        Assert.Equal(scene, sceneItem.Scene);
        Assert.Equal(media, sceneItem.Media);
    }

    [Fact]
    public void SceneItem_Should_Support_Positioning()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            MediaId = 1,
            X = 50,
            Y = 75,
            Width = 400,
            Height = 300
        };

        // Assert
        Assert.Equal(50, sceneItem.X);
        Assert.Equal(75, sceneItem.Y);
        Assert.Equal(400, sceneItem.Width);
        Assert.Equal(300, sceneItem.Height);
    }

    [Fact]
    public void SceneItem_Should_Support_Layering()
    {
        // Arrange & Act
        var backgroundItem = new SceneItem
        {
            MediaId = 1,
            ZIndex = 0
        };
        var foregroundItem = new SceneItem
        {
            MediaId = 2,
            ZIndex = 10
        };

        // Assert
        Assert.Equal(0, backgroundItem.ZIndex);
        Assert.Equal(10, foregroundItem.ZIndex);
        Assert.True(foregroundItem.ZIndex > backgroundItem.ZIndex);
    }

    [Fact]
    public void SceneItem_Should_Support_Opacity()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            MediaId = 1,
            Opacity = 0.8f
        };

        // Assert
        Assert.Equal(0.8f, sceneItem.Opacity);
        Assert.True(sceneItem.Opacity >= 0.0f && sceneItem.Opacity <= 1.0f);
    }

    [Fact]
    public void SceneItem_Should_Support_Animation_Properties()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            MediaId = 1,
            AnimationIn = "fadeIn",
            AnimationOut = "fadeOut",
            AnimationDuration = 1000
        };

        // Assert
        Assert.Equal("fadeIn", sceneItem.AnimationIn);
        Assert.Equal("fadeOut", sceneItem.AnimationOut);
        Assert.Equal(1000, sceneItem.AnimationDuration);
    }

    [Fact]
    public void SceneItem_Should_Support_Rotation()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            MediaId = 1,
            Rotation = 45.0f
        };

        // Assert
        Assert.Equal(45.0f, sceneItem.Rotation);
    }

    [Fact]
    public void SceneItem_Should_Allow_Custom_Duration()
    {
        // Arrange & Act
        var sceneItem = new SceneItem
        {
            MediaId = 1,
            DurationSeconds = 60,
            UseCustomDuration = true
        };

        // Assert
        Assert.Equal(60, sceneItem.DurationSeconds);
        Assert.True(sceneItem.UseCustomDuration);
    }
}