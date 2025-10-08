using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PMM.API.Converters
{
    public class CustomDateOnlyConverter : JsonConverter<DateOnly>
    {
        private readonly string[] _formats = new[]
        {
            "dd-MM-yyyy",
            "dd/MM/yyyy",
            "yyyy-MM-dd",
            "yyyy/MM/dd",
            "dd-M-yyyy",
            "d-M-yyyy",
            "d-MM-yyyy"
        };

        public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
                throw new JsonException("Date value cannot be null or empty.");

            foreach (var format in _formats)
            {
                if (DateOnly.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    return date;
                }
            }

            throw new JsonException($"Unable to parse date '{value}'. Expected formats: {string.Join(", ", _formats)}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
        }
    }

    public class NullableCustomDateOnlyConverter : JsonConverter<DateOnly?>
    {
        private readonly string[] _formats = new[]
        {
            "dd-MM-yyyy",
            "dd/MM/yyyy",
            "yyyy-MM-dd",
            "yyyy/MM/dd",
            "dd-M-yyyy",
            "d-M-yyyy",
            "d-MM-yyyy"
        };

        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
                return null;

            foreach (var format in _formats)
            {
                if (DateOnly.TryParseExact(value, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    return date;
                }
            }

            throw new JsonException($"Unable to parse date '{value}'. Expected formats: {string.Join(", ", _formats)}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
            else
                writer.WriteNullValue();
        }
    }
}
