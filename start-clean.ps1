# Clean build script for Miftah application
# This script cleans the build folders, installs dependencies, and starts the app

# Stop on any error
$ErrorActionPreference = "Stop"

Write-Host "==== Miftah Clean Start Script ===="
Write-Host

try {
    # Check if running as administrator
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-Not $isAdmin) {
        Write-Host "Warning: Not running as administrator. Some operations might fail." -ForegroundColor Yellow
        Write-Host "Consider rerunning this script as administrator if you encounter permission issues."
        Write-Host
    }
    
    # Clean .next folder
    if (Test-Path ".next") {
        Write-Host "Cleaning .next folder..." -ForegroundColor Cyan
        try {
            Remove-Item -Path ".next" -Recurse -Force
            Write-Host "✓ .next folder deleted" -ForegroundColor Green
        } catch {
            Write-Host "× Could not delete .next folder: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  Attempting to fix permissions..." -ForegroundColor Yellow
            
            if (Test-Path "fix-next-folder-permissions.ps1") {
                & .\fix-next-folder-permissions.ps1
            } else {
                Write-Host "  Permission fix script not found." -ForegroundColor Red
            }
        }
    } else {
        Write-Host "✓ .next folder not present (already clean)" -ForegroundColor Green
    }
    
    # Clean node_modules (optional, uncomment if needed)
    <#
    if (Test-Path "node_modules") {
        Write-Host "Cleaning node_modules folder..." -ForegroundColor Cyan
        try {
            Remove-Item -Path "node_modules" -Recurse -Force
            Write-Host "✓ node_modules folder deleted" -ForegroundColor Green
        } catch {
            Write-Host "× Could not delete node_modules folder: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    #>
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
    
    # Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed with exit code $LASTEXITCODE" }
    Write-Host "✓ Prisma client generated" -ForegroundColor Green
    
    # Build the application
    Write-Host "Building Next.js application..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "build failed with exit code $LASTEXITCODE" }
    Write-Host "✓ Application built successfully" -ForegroundColor Green
    
    # Start the application
    Write-Host "Starting the application..." -ForegroundColor Cyan
    Write-Host "The application will be available at http://localhost:9002"
    Write-Host "Press Ctrl+C to stop the application"
    Write-Host
    npm run dev
    
} catch {
    Write-Host "× Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
