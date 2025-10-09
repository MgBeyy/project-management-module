using PMM.Core.DTOs;
using PMM.Core.Forms;
using PMM.Data.Entities;

namespace PMM.Core.Mappers
{
    public class LabelMapper
    {
        public static Label Map(CreateLabelForm form)
        {
            return new Label
            {
                Name = form.Name,
                Color = form.Color,
                Description = form.Description
            };
        }

        public static LabelDto Map(Label label)
        {
            return new LabelDto
            {
                Id = label.Id,
                Name = label.Name,
                Color = label.Color,
                Description = label.Description,
                CreatedAt = label.CreatedAt,
                CreatedById = label.CreatedById,
                UpdatedAt = label.UpdatedAt,
                UpdatedById = label.UpdatedById
            };
        }

        public static List<LabelDto> Map(List<Label> labels)
        {
            return labels.Select(l => Map(l)).ToList();
        }

        public static Label Map(UpdateLabelForm form, Label label)
        {
            label.Name = form.Name;
            label.Color = form.Color;
            label.Description = form.Description;
            return label;
        }
    }
}
