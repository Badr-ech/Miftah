# Update Prisma client and run MongoDB seed script
Write-Host "===== MongoDB Database Management Script =====" -ForegroundColor Green
Write-Host "1. Generating Prisma client for MongoDB schema"
npx prisma generate

# Check if generation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma client generated successfully" -ForegroundColor Green
    
    Write-Host "2. Seeding MongoDB database with initial data"
    try {
        # Run the MongoDB seed with better error handling
        npx ts-node --compiler-options="{\"module\":\"CommonJS\"}" prisma/mongodb-seed.ts
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "MongoDB database seeded successfully" -ForegroundColor Green
        } else {
            Write-Host "Failed to seed MongoDB database. Check the error messages above." -ForegroundColor Red
        }
    } 
    catch {
        Write-Host "Error running MongoDB seed script: $_" -ForegroundColor Red
    }
} 
else {
    Write-Host "Failed to generate Prisma client. Fix any schema errors before continuing." -ForegroundColor Red
}

Write-Host "Script completed. Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
