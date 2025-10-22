FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ProjectManagementModule.sln ./
COPY PMM.Core/PMM.Core.csproj PMM.Core/
COPY PMM.Data/PMM.Data.csproj PMM.Data/
COPY PMM.API/PMM.API.csproj PMM.API/
COPY PMM.Domain/PMM.Domain.csproj PMM.Domain/

RUN dotnet restore ProjectManagementModule.sln

COPY . .

WORKDIR "/src/PMM.API"
RUN dotnet publish "PMM.API.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PMM.API.dll"]


