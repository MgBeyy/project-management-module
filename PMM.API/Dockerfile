FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ProjectManagementModule.sln ./
COPY PMM.Core/PMM.Core.csproj PMM.Core/
COPY PMM.Data/PMM.Data.csproj PMM.Data/
COPY PMM.API/PMM.API.csproj PMM.API/
COPY PMM.Domain/PMM.Domain.csproj PMM.Domain/

RUN dotnet restore ProjectManagementModule.sln


WORKDIR /src/PMM.API
ENTRYPOINT ["dotnet", "run", "--urls", "http://0.0.0.0:5000", "--project", "PMM.API.csproj"]
