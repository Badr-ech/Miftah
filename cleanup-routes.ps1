# PowerShell script to remove conflicting routes
# Should be run before build to ensure no route conflicts exist

Write-Output "Cleaning up conflicting route.js files..."

$routeFiles = @(
    "src\app\(app)\teacher\analytics\route.js",
    "src\app\(app)\teacher\courses\new\route.js",
    "src\app\(app)\teacher\courses\route.js",
    "src\app\(app)\teacher\communication\route.js",
    "src\app\(app)\progress\route.js"
)

foreach ($file in $routeFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Output "Removed: $file"
    } else {
        Write-Output "File not found: $file - skipping"
    }
}

Write-Output "Route cleanup completed"
