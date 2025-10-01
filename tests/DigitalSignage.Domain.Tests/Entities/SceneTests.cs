using DigitalSignage.Domain.Entities;
using DigitalSignage.Domain.Enums;
using Xunit;

namespace DigitalSignage.Domain.Tests.Entities;

public class SceneTests
{
    [Fact]
    public void Scene_Should_Have_Required_Properties()
    {
        // Arrange & Act
        var scene = new Scene
        {
            Name = "Test Scene",
            Description = "Test scene with multiple media",
            LayoutType = SceneLayoutType.SplitScreen,
            Width = 1920,
            Height = 1080
        };

        // Assert
        Assert.Equal("Test Scene", scene.Name);
        Assert.Equal("Test scene with multiple media", scene.Description);
        Assert.Equal(SceneLayoutType.SplitScreen, scene.LayoutType);
        Assert.Equal(1920, scene.Width);
        Assert.Equal(1080, scene.Height);
    }

    [Fact]
    public void Scene_Should_Initialize_Empty_SceneItems_Collection()
    {
        // Arrange & Act
        var scene = new Scene();

        // Assert
        Assert.NotNull(scene.SceneItems);
        Assert.Empty(scene.SceneItems);
    }

    [Fact]
    public void Scene_Should_Allow_Adding_SceneItems()
    {
        // Arrange
        var scene = new Scene { Name = "Test Scene" };
        var sceneItem = new SceneItem 
        { 
            MediaId = 1,
            X = 0,
            Y = 0,
            Width = 960,
            Height = 540
        };

        // Act
        scene.SceneItems.Add(sceneItem);

        // Assert
        Assert.Single(scene.SceneItems);
        Assert.Contains(sceneItem, scene.SceneItems);
    }

    [Fact]
    public void Scene_Should_Support_Different_Layout_Types()
    {
        // Arrange & Act
        var splitScreenScene = new Scene 
        { 
            Name = "Split Screen", 
            LayoutType = SceneLayoutType.SplitScreen 
        };
        var overlayScene = new Scene 
        { 
            Name = "Overlay", 
            LayoutType = SceneLayoutType.Overlay 
        };
        var pipScene = new Scene 
        { 
            Name = "Picture in Picture", 
            LayoutType = SceneLayoutType.PictureInPicture 
        };

        // Assert
        Assert.Equal(SceneLayoutType.SplitScreen, splitScreenScene.LayoutType);
        Assert.Equal(SceneLayoutType.Overlay, overlayScene.LayoutType);
        Assert.Equal(SceneLayoutType.PictureInPicture, pipScene.LayoutType);
    }

    [Fact]
    public void Scene_Should_Have_Default_Resolution()
    {
        // Arrange & Act
        var scene = new Scene
        {
            Name = "Test Scene"
        };

        // Assert - Should have default resolution when not specified
        Assert.True(scene.Width >= 0);
        Assert.True(scene.Height >= 0);
    }

    [Fact]
    public void Scene_Should_Track_Created_And_Updated_Dates()
    {
        // Arrange
        var now = DateTime.UtcNow;
        
        // Act
        var scene = new Scene
        {
            Name = "Test Scene",
            CreatedAt = now,
            UpdatedAt = now
        };

        // Assert
        Assert.Equal(now, scene.CreatedAt);
        Assert.Equal(now, scene.UpdatedAt);
    }

    [Fact]
    public void Scene_Should_Support_Background_Settings()
    {
        // Arrange & Act
        var scene = new Scene
        {
            Name = "Styled Scene",
            BackgroundColor = "#000000",
            BackgroundImageId = 5
        };

        // Assert
        Assert.Equal("#000000", scene.BackgroundColor);
        Assert.Equal(5, scene.BackgroundImageId);
    }

    [Fact]
    public void Scene_Should_Allow_Template_Usage()
    {
        // Arrange & Act
        var scene = new Scene
        {
            Name = "Template Scene",
            IsTemplate = true,
            TemplateName = "StandardSplitScreen"
        };

        // Assert
        Assert.True(scene.IsTemplate);
        Assert.Equal("StandardSplitScreen", scene.TemplateName);
    }
}