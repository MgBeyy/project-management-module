# SDK image (development)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution & project files
COPY ProjectManagementModule.sln ./
COPY PMM.Core/PMM.Core.csproj PMM.Core/
COPY PMM.Data/PMM.Data.csproj PMM.Data/
COPY PMM.API/PMM.API.csproj PMM.API/
COPY PMM.Domain/PMM.Domain.csproj PMM.Domain/

# Restore dependencies
RUN dotnet restore ProjectManagementModule.sln

# Copy rest of the source code
COPY . .

# Build (development mode)
WORKDIR /src/PMM.API
RUN dotnet build -c Debug

# Run API
ENTRYPOINT ["dotnet", "run", "--urls", "http://0.0.0.0:5000", "--project", "PMM.API.csproj"]
