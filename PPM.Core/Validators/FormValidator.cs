using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Validators
{
    public class FormValidator
    {
        public static FormValidatorResults Validate(object model)
        {
            var context = new ValidationContext(model, serviceProvider: null, items: null);
            var results = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(model, context, results, true);
            return new FormValidatorResults(isValid, results);
        }
    }
}
