@echo off
echo Encoding MongoDB Atlas connection string...
echo This will properly encode any special characters in your DATABASE_URL
echo.
node encode-mongodb-uri.js
echo.
echo If your connection string needed encoding, update it in:
echo 1. Your .env file
echo 2. GitHub repository secrets (Settings > Secrets and variables > Actions)
echo.
pause
