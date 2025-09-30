using DigitalSignage.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace DigitalSignage.Application.DTOs;

public class CreateSceneRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public SceneLayoutType LayoutType { get; set; } = SceneLayoutType.Custom;
    
    [Range(1, 7680)]
    public int Width { get; set; } = 1920;
    
    [Range(1, 4320)]
    public int Height { get; set; } = 1080;
    
    [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Background color must be a valid hex color")]
    public string? BackgroundColor { get; set; }
    
    public int? BackgroundImageId { get; set; }
    
    public bool IsTemplate { get; set; } = false;
    
    [StringLength(100)]
    public string? TemplateName { get; set; }
    
    public List<CreateSceneItemRequest> SceneItems { get; set; } = new();
}

public class CreateSceneItemRequest
{
    [Required]
    public int MediaId { get; set; }
    
    [Range(0, int.MaxValue)]
    public int X { get; set; }
    
    [Range(0, int.MaxValue)]
    public int Y { get; set; }
    
    [Range(1, int.MaxValue)]
    public int Width { get; set; }
    
    [Range(1, int.MaxValue)]
    public int Height { get; set; }
    
    [Range(0, 1000)]
    public int ZIndex { get; set; } = 0;
    
    [Range(0.0f, 1.0f)]
    public float Opacity { get; set; } = 1.0f;
    
    [Range(-360.0f, 360.0f)]
    public float Rotation { get; set; } = 0.0f;
    
    [StringLength(50)]
    public string? AnimationIn { get; set; }
    
    [StringLength(50)]
    public string? AnimationOut { get; set; }
    
    [Range(0, 10000)]
    public int AnimationDuration { get; set; } = 0;
    
    [Range(1, int.MaxValue)]
    public int DurationSeconds { get; set; }
    
    public bool UseCustomDuration { get; set; } = false;
}

public class UpdateSceneRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    public SceneLayoutType LayoutType { get; set; }
    
    [Range(1, 7680)]
    public int Width { get; set; }
    
    [Range(1, 4320)]
    public int Height { get; set; }
    
    [RegularExpression(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", ErrorMessage = "Background color must be a valid hex color")]
    public string? BackgroundColor { get; set; }
    
    public int? BackgroundImageId { get; set; }
    
    public bool IsTemplate { get; set; }
    
    [StringLength(100)]
    public string? TemplateName { get; set; }
}