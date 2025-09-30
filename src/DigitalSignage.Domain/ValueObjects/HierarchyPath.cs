namespace DigitalSignage.Domain.ValueObjects;

public class HierarchyPath : ValueObject
{
    public string FullPath { get; private set; }
    public IReadOnlyList<string> Segments { get; private set; }
    public int Depth => Segments.Count;
    
    private HierarchyPath(string fullPath, IEnumerable<string> segments)
    {
        FullPath = fullPath;
        Segments = segments.ToList().AsReadOnly();
    }
    
    public static HierarchyPath Create(IEnumerable<string> segments)
    {
        var segmentList = segments.Where(s => !string.IsNullOrWhiteSpace(s)).ToList();
        var fullPath = string.Join(" / ", segmentList);
        return new HierarchyPath(fullPath, segmentList);
    }
    
    public static HierarchyPath Root() => new HierarchyPath(string.Empty, Enumerable.Empty<string>());
    
    public HierarchyPath AppendSegment(string segment)
    {
        if (string.IsNullOrWhiteSpace(segment))
            return this;
            
        var newSegments = Segments.Concat(new[] { segment });
        return Create(newSegments);
    }
    
    public HierarchyPath RemoveLastSegment()
    {
        if (Segments.Count == 0)
            return this;
            
        var newSegments = Segments.Take(Segments.Count - 1);
        return Create(newSegments);
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return FullPath;
    }
    
    public override string ToString() => FullPath;
}