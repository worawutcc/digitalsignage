using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Application.DTOs;

public class SceneDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SceneLayoutType LayoutType { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public string? BackgroundColor { get; set; }
    public int? BackgroundImageId { get; set; }
    public string? BackgroundImageName { get; set; }
    public bool IsTemplate { get; set; }
    public string? TemplateName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    public List<SceneItemDto> SceneItems { get; set; } = new();
    public int TotalItems => SceneItems.Count;
}

public class SceneItemDto
{
    public int Id { get; set; }
    public int SceneId { get; set; }
    public int MediaId { get; set; }
    public string MediaName { get; set; } = string.Empty;
    public string MediaFileName { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int ZIndex { get; set; }
    public float Opacity { get; set; }
    public float Rotation { get; set; }
    public string? AnimationIn { get; set; }
    public string? AnimationOut { get; set; }
    public int AnimationDuration { get; set; }
    public int DurationSeconds { get; set; }
    public bool UseCustomDuration { get; set; }
}