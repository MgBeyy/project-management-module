using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace PMM.Core.Common
{
    public static class OrderByHelper
    {
        public static IQueryable<T> OrderByDynamic<T>(IQueryable<T> query, string? propertyName, bool desc)
        {
            if (string.IsNullOrWhiteSpace(propertyName))
                return query.OrderBy(e => EF.Property<object>(e, "Id"));

            var prop = typeof(T).GetProperty(propertyName, System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);
            if (prop == null)
                return query.OrderBy(e => EF.Property<object>(e, "Id"));

            var param = Expression.Parameter(typeof(T), "x");
            var property = Expression.Property(param, prop);
            var lambda = Expression.Lambda(property, param);
            string methodName = desc ? "OrderByDescending" : "OrderBy";
            var result = typeof(Queryable).GetMethods()
                .First(m => m.Name == methodName && m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), prop.PropertyType)
                .Invoke(null, new object[] { query, lambda });
            return (IQueryable<T>)result;
        }
    }
}
