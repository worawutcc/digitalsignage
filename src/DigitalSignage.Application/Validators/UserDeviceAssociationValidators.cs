using FluentValidation;
using DigitalSignage.Application.DTOs;

namespace DigitalSignage.Application.Validators;

public class CreateUserDeviceAssociationRequestValidator : AbstractValidator<CreateUserDeviceAssociationRequest>
{
    public CreateUserDeviceAssociationRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.DeviceId).NotEmpty();
        RuleFor(x => x.AssociationType).MaximumLength(32);
    }
}

public class UpdateUserDeviceAssociationRequestValidator : AbstractValidator<UpdateUserDeviceAssociationRequest>
{
    public UpdateUserDeviceAssociationRequestValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AssociationType).MaximumLength(32);
    }
}
