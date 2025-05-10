# Script to clear browser cache and cookies for the Miftah application
# This can help resolve issues with authentication and stale data

Write-Host "================ Miftah Browser Cache Cleanup ================"

# Define the application URL and domain
$appUrl = "http://localhost:9002"
$appDomain = "localhost"

Write-Host "This script will provide instructions for clearing browser caches"
Write-Host "specifically for the Miftah application running on $appUrl"
Write-Host

Write-Host "Choose your browser:"
Write-Host "1. Chrome"
Write-Host "2. Firefox"
Write-Host "3. Edge"
Write-Host "4. All browsers"
Write-Host

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nChrome Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open Chrome and press Ctrl+Shift+Delete"
        Write-Host "2. Set time range to 'All time'"
        Write-Host "3. Check 'Cookies and site data' and 'Cached images and files'"
        Write-Host "4. Click 'Clear data'"
        Write-Host "5. Navigate to $appUrl and try again"
        
        Write-Host "`nTo clear only Miftah cookies:" -ForegroundColor Yellow
        Write-Host "1. Navigate to $appUrl"
        Write-Host "2. Click the lock icon in the address bar"
        Write-Host "3. Click 'Cookies'"
        Write-Host "4. Select and remove all cookies for $appDomain"
    }
    "2" {
        Write-Host "`nFirefox Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open Firefox and press Ctrl+Shift+Delete"
        Write-Host "2. Set time range to 'Everything'"
        Write-Host "3. Check 'Cookies' and 'Cache'"
        Write-Host "4. Click 'Clear Now'"
        Write-Host "5. Navigate to $appUrl and try again"
        
        Write-Host "`nTo clear only Miftah cookies:" -ForegroundColor Yellow
        Write-Host "1. Open Firefox and click the menu button (≡)"
        Write-Host "2. Select 'Settings'"
        Write-Host "3. Go to 'Privacy & Security'"
        Write-Host "4. In 'Cookies and Site Data', click 'Manage Data'"
        Write-Host "5. Search for '$appDomain' and remove those cookies"
    }
    "3" {
        Write-Host "`nEdge Instructions:" -ForegroundColor Cyan
        Write-Host "1. Open Edge and press Ctrl+Shift+Delete"
        Write-Host "2. Set time range to 'All time'"
        Write-Host "3. Check 'Cookies and other site data' and 'Cached images and files'"
        Write-Host "4. Click 'Clear now'"
        Write-Host "5. Navigate to $appUrl and try again"
        
        Write-Host "`nTo clear only Miftah cookies:" -ForegroundColor Yellow
        Write-Host "1. Navigate to $appUrl"
        Write-Host "2. Click the lock icon in the address bar"
        Write-Host "3. Click 'Cookies'"
        Write-Host "4. Select and remove all cookies for $appDomain"
    }
    "4" {
        Write-Host "`nInstructions for all browsers:" -ForegroundColor Green
        Write-Host "Press Ctrl+Shift+Delete in your browser" -ForegroundColor Cyan
        Write-Host "Make sure to clear both cookies and cache for all time periods" -ForegroundColor Cyan
        Write-Host "After clearing, restart your browser and try accessing $appUrl again" -ForegroundColor Cyan
        
        Write-Host "`nFor a complete reset, you can also:" -ForegroundColor Yellow
        Write-Host "1. Run the 'start-clean.ps1' script with admin privileges"
        Write-Host "2. Clear browser cookies and cache as described above"
        Write-Host "3. Restart your computer (if other steps don't resolve the issue)"
    }
    default {
        Write-Host "`nInvalid choice. Please run the script again and enter a number between 1 and 4." -ForegroundColor Red
    }
}

Write-Host "`nAdditional troubleshooting tips:" -ForegroundColor Green
Write-Host "- Use incognito/private browsing mode to test without cached data"
Write-Host "- Ensure MongoDB is running if you're using a local database"
Write-Host "- Check the browser console (F12) for any JavaScript errors"
Write-Host "- Review the server logs for API errors"
Write-Host "- Try the 'quick login' option with different roles if regular login fails"
Write-Host

Write-Host "================ Cache Cleanup Instructions Complete ================"
