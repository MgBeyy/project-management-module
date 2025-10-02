# SDK image (development)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution & restore dependencies
COPY ../ProjectManagementModule.sln ./
COPY ../PMM.Core/PMM.Core.csproj PMM.Core/
COPY ../PMM.Data/PMM.Data.csproj PMM.Data/
COPY ./PMM.API.csproj PMM.API/
RUN dotnet restore ProjectManagementModule.sln

# Copy all source code
COPY .. .

# Build (development mode)
WORKDIR /src/PMM.API
RUN dotnet build -c Debug

# Run API
ENTRYPOINT ["dotnet", "run", "--urls", "http://0.0.0.0:5000", "--project", "PMM.API.csproj"]
