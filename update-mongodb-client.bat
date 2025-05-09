@echo off
REM This script will generate the Prisma client for your MongoDB database
echo Generating Prisma client for MongoDB...
npx prisma generate

REM Check if the generation was successful
if %ERRORLEVEL% EQU 0 (
    echo Prisma client generation successful!
    echo.
    echo Next steps:
    echo 1. Run your application with the MongoDB database
    echo 2. If you need to seed your database, run: npx prisma db seed
) else (
    echo Error generating Prisma client. Please check your schema.prisma file.
)

pause
