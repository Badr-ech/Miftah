@echo off
echo Running MongoDB seed script with CommonJS mode...
npx ts-node --compiler-options="{\"module\":\"CommonJS\"}" prisma/mongodb-seed.ts

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Seeding MongoDB database completed successfully!
) else (
    echo.
    echo Error seeding MongoDB database. Please check the error messages above.
)

pause
