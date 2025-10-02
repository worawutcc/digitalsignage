namespace DigitalSignage.Domain.Entities;

public class SceneItem : BaseEntity
{
    public int Id { get; set; }
    public int SceneId { get; set; }
    public int MediaId { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public int ZIndex { get; set; } = 0;
    public float Opacity { get; set; } = 1.0f;
    public float Rotation { get; set; } = 0.0f;
    public string? AnimationIn { get; set; }
    public string? AnimationOut { get; set; }
    public int AnimationDuration { get; set; } = 0;
    public int DurationSeconds { get; set; }
    public bool UseCustomDuration { get; set; } = false;

    // Navigation properties
    public Scene Scene { get; set; } = null!;
    public Media Media { get; set; } = null!;
}