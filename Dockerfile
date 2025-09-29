# 1. Build 
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

RUN dotnet restore ./API/API.csproj

RUN dotnet publish ./API/API.csproj -c Release -o /app/publish

# 2. Runtime 
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app


COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

COPY --from=build /app/publish .

ENTRYPOINT ["./entrypoint.sh"]
