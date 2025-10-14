using PMM.Core.Exceptions;

namespace PMM.Core.Helpers
{
    public static class DateTimeHelper
    {
        #region DateTime

        public static long ToUnixMilliseconds(DateTime dateTime)
        {
            if (dateTime == default)
                throw new BusinessException("DateTime cannot be default value");

            var utcDateTime = dateTime.Kind == DateTimeKind.Utc ? dateTime : dateTime.ToUniversalTime();
            return (long)(utcDateTime - DateTime.UnixEpoch).TotalMilliseconds;
        }

        public static DateTime FromUnixMillisecondsToDateTime(long unixMilliseconds)
        {
            if (unixMilliseconds < 0)
                throw new BusinessException("Unix milliseconds cannot be negative");

            return DateTime.UnixEpoch.AddMilliseconds(unixMilliseconds);
        }

        #endregion

        #region DateOnly

        public static long ToUnixMilliseconds(DateOnly dateOnly)
        {
            if (dateOnly == default)
                throw new BusinessException("DateOnly cannot be default value");

            var dateTime = new DateTime(dateOnly.Year, dateOnly.Month, dateOnly.Day, 0, 0, 0, DateTimeKind.Utc);
            return (long)(dateTime - DateTime.UnixEpoch).TotalMilliseconds;
        }

        public static DateOnly FromUnixMillisecondsToDateOnly(long unixMilliseconds)
        {
            if (unixMilliseconds < 0)
                throw new BusinessException("Unix milliseconds cannot be negative");

            var dateTime = DateTime.UnixEpoch.AddMilliseconds(unixMilliseconds);
            return DateOnly.FromDateTime(dateTime);
        }

        #endregion
    }

    #region Extensions

    public static class DateTimeExtensions
    {
        public static long ToUnixMilliseconds(this DateTime dateTime)
        {
            return DateTimeHelper.ToUnixMilliseconds(dateTime);
        }

        public static DateTime ToDateTimeFromUnixMilliseconds(this long unixMilliseconds)
        {
            return DateTimeHelper.FromUnixMillisecondsToDateTime(unixMilliseconds);
        }

        public static long ToUnixMilliseconds(this DateOnly dateOnly)
        {
            return DateTimeHelper.ToUnixMilliseconds(dateOnly);
        }

        public static DateOnly ToDateOnlyFromUnixMilliseconds(this long unixMilliseconds)
        {
            return DateTimeHelper.FromUnixMillisecondsToDateOnly(unixMilliseconds);
        }
    }

    #endregion
}