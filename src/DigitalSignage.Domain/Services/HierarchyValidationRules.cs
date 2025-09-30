using DigitalSignage.Domain.Interfaces;

namespace DigitalSignage.Domain.Services;

public static class HierarchyValidationRules
{
    public const int MaxDepth = 10;
    public const int MaxChildrenPerGroup = 1000;
    
    public static ValidationResult ValidateGroupCreation(string name, int? parentGroupId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return ValidationResult.Failure("Group name is required");
            
        if (name.Length > 200)
            return ValidationResult.Failure("Group name cannot exceed 200 characters");
            
        return ValidationResult.Success;
    }
    
    public static async Task<ValidationResult> ValidateGroupMoveAsync(
        IDeviceGroupRepository repository, 
        int groupId, 
        int? newParentId)
    {
        if (newParentId == null)
            return ValidationResult.Success; // Moving to root is always valid
            
        if (groupId == newParentId)
            return ValidationResult.Failure("Group cannot be its own parent");
            
        // Check if new parent is descendant of moving group
        if (await repository.IsDescendantOfAsync(newParentId.Value, groupId))
            return ValidationResult.Failure("Cannot move group to its own descendant");
            
        // Check depth limit
        var newDepth = await repository.GetDepthAsync(newParentId.Value) + 1;
        if (newDepth > MaxDepth)
            return ValidationResult.Failure($"Move would exceed maximum depth of {MaxDepth}");
            
        return ValidationResult.Success;
    }
    
    public static ValidationResult ValidateHierarchyDepth(int currentDepth, int additionalLevels = 1)
    {
        if (currentDepth + additionalLevels > MaxDepth)
            return ValidationResult.Failure($"Operation would exceed maximum hierarchy depth of {MaxDepth}");
            
        return ValidationResult.Success;
    }
    
    public static ValidationResult ValidateChildrenCount(int currentChildrenCount, int additionalChildren = 1)
    {
        if (currentChildrenCount + additionalChildren > MaxChildrenPerGroup)
            return ValidationResult.Failure($"Group cannot have more than {MaxChildrenPerGroup} direct children");
            
        return ValidationResult.Success;
    }
}

public class ValidationResult
{
    public bool IsValid { get; private set; }
    public string ErrorMessage { get; private set; }
    
    private ValidationResult(bool isValid, string errorMessage = "")
    {
        IsValid = isValid;
        ErrorMessage = errorMessage;
    }
    
    public static ValidationResult Success => new(true);
    public static ValidationResult Failure(string errorMessage) => new(false, errorMessage);
}