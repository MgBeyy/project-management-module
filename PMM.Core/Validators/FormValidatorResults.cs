using System.ComponentModel.DataAnnotations;

namespace PMM.Core.Validators
{
    public class FormValidatorResults
    {
        public bool IsValid { get; set; }
        public Dictionary<string, List<string>> Errors { get; set; }

        public FormValidatorResults(bool isValid, List<ValidationResult> results)
        {
            IsValid = isValid;

            if (!isValid && results != null)
            {
                Errors = new Dictionary<string, List<string>>();
                foreach (var item in results)
                {
                    var message = item.ErrorMessage;
                    foreach (var member in item.MemberNames)
                    {
                        if (!Errors.ContainsKey(member))
                            Errors.Add(member, new List<string>());
                        Errors[member].Add(message ?? string.Empty);
                    }
                }
            }
        }
    }
}
