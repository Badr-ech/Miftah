# Health Check Script for Miftah Application
# This script performs various health checks to diagnose issues

Write-Host "================== Miftah Health Check =================="
Write-Host "Running diagnostic checks for the Miftah application..."
Write-Host

# Check environment variables
Write-Host "1. Checking environment variables..."
$envFile = Get-Content -Path ".env" -ErrorAction SilentlyContinue

if ($envFile) {
    $dbUrl = $envFile | Where-Object { $_ -match "DATABASE_URL" }
    $nextAuthSecret = $envFile | Where-Object { $_ -match "NEXTAUTH_SECRET" }
    
    Write-Host "  - Database URL: " -NoNewLine
    if ($dbUrl) {
        $masked = ($dbUrl -replace "(mongodb(\+srv)?:\/\/[^:]+:)([^@]+@)", '$1******@')
        Write-Host "Found - $masked" -ForegroundColor Green
    } else {
        Write-Host "Missing" -ForegroundColor Red
    }

    Write-Host "  - NEXTAUTH_SECRET: " -NoNewLine
    if ($nextAuthSecret) {
        Write-Host "Found" -ForegroundColor Green
    } else {
        Write-Host "Missing" -ForegroundColor Red
        Write-Host "    Recommendation: Add NEXTAUTH_SECRET to .env file" -ForegroundColor Yellow
    }
} else {
    Write-Host "  .env file not found!" -ForegroundColor Red
}
Write-Host

# Check Prisma schema
Write-Host "2. Checking Prisma configuration..."
$prismaSchema = Get-Content -Path "prisma/schema.prisma" -ErrorAction SilentlyContinue

if ($prismaSchema) {
    $provider = $prismaSchema | Where-Object { $_ -match "provider\s+=\s+""mongodb""" }
    
    Write-Host "  - MongoDB provider: " -NoNewLine
    if ($provider) {
        Write-Host "Found" -ForegroundColor Green
    } else {
        Write-Host "Not configured properly" -ForegroundColor Red
    }

    $output = $prismaSchema | Where-Object { $_ -match "output\s+=\s+""(.*?)""" }
    if ($output -match "output\s+=\s+""(.*?)""") {
        $outputPath = $Matches[1]
        Write-Host "  - Output path: $outputPath" -ForegroundColor Cyan
        
        Write-Host "  - Checking Prisma client: " -NoNewLine
        if (Test-Path $outputPath) {
            Write-Host "Found" -ForegroundColor Green
        } else {
            Write-Host "Missing" -ForegroundColor Red
            Write-Host "    Recommendation: Run 'npx prisma generate' to generate the client" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  prisma/schema.prisma file not found!" -ForegroundColor Red
}
Write-Host

# Check Node.js modules
Write-Host "3. Checking Node.js modules..."
$packageJson = Get-Content -Path "package.json" -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json -ErrorAction SilentlyContinue

if ($packageJson) {
    $prismaVersion = $packageJson.dependencies.prisma
    $prismaClientVersion = $packageJson.dependencies."@prisma/client"
    $nextVersion = $packageJson.dependencies.next
    $mongodbVersion = $packageJson.dependencies.mongodb
    
    Write-Host "  - Prisma: " -NoNewLine
    if ($prismaVersion) {
        Write-Host $prismaVersion -ForegroundColor Green
    } else {
        Write-Host "Not found" -ForegroundColor Red
    }
    
    Write-Host "  - Prisma Client: " -NoNewLine
    if ($prismaClientVersion) {
        Write-Host $prismaClientVersion -ForegroundColor Green
    } else {
        Write-Host "Not found" -ForegroundColor Red
    }
    
    Write-Host "  - Next.js: " -NoNewLine
    if ($nextVersion) {
        Write-Host $nextVersion -ForegroundColor Green
    } else {
        Write-Host "Not found" -ForegroundColor Red
    }
    
    Write-Host "  - MongoDB: " -NoNewLine
    if ($mongodbVersion) {
        Write-Host $mongodbVersion -ForegroundColor Green
    } else {
        Write-Host "Not installed" -ForegroundColor Yellow
        Write-Host "    Recommendation: Run 'npm install mongodb' if needed for direct MongoDB access" -ForegroundColor Yellow
    }
} else {
    Write-Host "  package.json not found or invalid!" -ForegroundColor Red
}
Write-Host

# Check for .next folder and permissions
Write-Host "4. Checking .next folder..."
$nextFolder = ".next"

if (Test-Path $nextFolder) {
    Write-Host "  - .next folder: Found" -ForegroundColor Cyan
    
    try {
        $acl = Get-Acl $nextFolder -ErrorAction Stop
        Write-Host "  - Owner: $($acl.Owner)" -ForegroundColor Cyan
        
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $userHasFullControl = $acl.Access | Where-Object { 
            $_.IdentityReference.Value -eq $currentUser -and $_.FileSystemRights -match "FullControl" 
        }
        
        Write-Host "  - Current user permissions: " -NoNewLine
        if ($userHasFullControl) {
            Write-Host "Full control" -ForegroundColor Green
        } else {
            Write-Host "Limited" -ForegroundColor Yellow
            Write-Host "    Recommendation: Run 'fix-next-folder-permissions.ps1' as administrator" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  - Unable to check permissions: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  - .next folder: Not found (This is normal if the app hasn't been built yet)" -ForegroundColor Cyan
}
Write-Host

Write-Host "5. Recommendations and next steps:"
Write-Host "  - Run 'npm run build' to generate a new build"
Write-Host "  - If you have permission issues with .next folder, run 'fix-next-folder-permissions.ps1' as admin"
Write-Host "  - Ensure MongoDB is running and accessible at the connection URL in .env"
Write-Host "  - Check API response logs in the console when using app features"
Write-Host "  - For login issues, use the quick login option until email login is fixed"
Write-Host

Write-Host "================== Health Check Complete =================="
