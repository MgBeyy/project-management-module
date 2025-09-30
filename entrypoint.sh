#!/bin/bash
set -e

echo "EF Core migration is being applied..."
dotnet ef database update --project ../Data/Data.csproj --startup-project API.csproj

echo "Backend is starting..."
exec dotnet PMM.API.dll