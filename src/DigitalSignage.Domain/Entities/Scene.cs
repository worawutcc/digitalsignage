using DigitalSignage.Domain.Enums;

namespace DigitalSignage.Domain.Entities;

public class Scene
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SceneLayoutType LayoutType { get; set; } = SceneLayoutType.Custom;
    public int Width { get; set; } = 1920;
    public int Height { get; set; } = 1080;
    public string? BackgroundColor { get; set; }
    public int? BackgroundImageId { get; set; }
    public bool IsTemplate { get; set; } = false;
    public string? TemplateName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int? CreatedByUserId { get; set; }

    // Navigation properties
    public User? CreatedByUser { get; set; }
    public Media? BackgroundImage { get; set; }
    public ICollection<SceneItem> SceneItems { get; set; } = new List<SceneItem>();
}