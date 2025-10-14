using System.Text.Json;
using System.Text.Json.Serialization;
using PMM.Core.Helpers;

namespace PMM.API.Converters
{
    public class CustomDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                var timestamp = reader.GetInt64();
                return DateTimeHelper.FromUnixMillisecondsToDateTime(timestamp);
            }

            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
                throw new JsonException("DateTime value cannot be null or empty.");

            if (long.TryParse(value, out var timestampFromString))
            {
                return DateTimeHelper.FromUnixMillisecondsToDateTime(timestampFromString);
            }

            throw new JsonException($"Unable to parse DateTime '{value}'. Expected Unix timestamp in milliseconds");
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            var timestamp = DateTimeHelper.ToUnixMilliseconds(value);
            writer.WriteNumberValue(timestamp);
        }
    }

    public class NullableCustomDateTimeConverter : JsonConverter<DateTime?>
    {
        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
                return null;

            if (reader.TokenType == JsonTokenType.Number)
            {
                var timestamp = reader.GetInt64();
                return DateTimeHelper.FromUnixMillisecondsToDateTime(timestamp);
            }

            var value = reader.GetString();
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (long.TryParse(value, out var timestampFromString))
            {
                return DateTimeHelper.FromUnixMillisecondsToDateTime(timestampFromString);
            }

            throw new JsonException($"Unable to parse DateTime '{value}'. Expected Unix timestamp in milliseconds");
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                var timestamp = DateTimeHelper.ToUnixMilliseconds(value.Value);
                writer.WriteNumberValue(timestamp);
            }
            else
                writer.WriteNullValue();
        }
    }
}