@echo off
cd /d "%~dp0"
echo Start the API in a second terminal: cd ..\ClinicBack-New ^&^& dotnet run --project TourSite.APIs --launch-profile http
if not exist node_modules call npm ci
call npm start
