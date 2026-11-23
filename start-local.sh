#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
printf 'Start the API first: cd ../ClinicBack-New && dotnet run --project TourSite.APIs --launch-profile http\n'
if [ ! -d node_modules ]; then npm ci; fi
exec npm start
