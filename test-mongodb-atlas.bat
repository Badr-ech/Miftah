@echo off
echo Testing MongoDB Atlas connection...
echo.
node mongodb-test-connection.js
echo.
if %ERRORLEVEL% EQU 0 (
  echo Connection test successful!
) else (
  echo Connection test failed! Please check the error messages above.
)
pause
