# PowerShell script to fix permissions on .next folder
# This script needs to be run with admin privileges

# Define paths
$nextFolderPath = Join-Path $PSScriptRoot ".next"

Write-Host "Fixing permissions for .next folder at: $nextFolderPath"

# Check if the folder exists
if (Test-Path $nextFolderPath) {
    try {
        # Take ownership of the folder
        Write-Host "Taking ownership of folder..."
        takeown /F "$nextFolderPath" /R /D Y | Out-Null
        
        # Grant full control to the current user
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        Write-Host "Granting full control to $currentUser..."
        icacls "$nextFolderPath" /grant "${currentUser}:(F)" /T /Q
        
        # Optional: Grant full control to Administrators group
        Write-Host "Granting full control to Administrators group..."
        icacls "$nextFolderPath" /grant "Administrators:(F)" /T /Q
        
        Write-Host "Permissions updated successfully."
        
        # Try to delete the folder
        Write-Host "Attempting to delete .next folder..."
        Remove-Item -Path "$nextFolderPath" -Recurse -Force
        
        if (!(Test-Path $nextFolderPath)) {
            Write-Host ".next folder deleted successfully!"
        } else {
            Write-Host ".next folder could not be deleted. Try restarting your terminal with admin privileges."
        }
    }
    catch {
        Write-Host "Error occurred: $_"
    }
} else {
    Write-Host ".next folder does not exist."
}

Write-Host "Script completed."
