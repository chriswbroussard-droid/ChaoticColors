# Simple HTTP Server in PowerShell
$port = 8000
$folder = "c:\Users\Chris Broussard\OneDrive\Desktop\chris-broussard-portfolio"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "HTTP Server running on http://localhost:$port/"
Write-Host "Serving files from: $folder"
Write-Host "Press Ctrl+C to stop"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        # URL decode the path properly
        $path = [System.Net.WebUtility]::UrlDecode($path)
        
        # Remove quotes and other problematic characters
        $path = $path -replace '"', ''
        $path = $path -replace '\?v=[^&]*', ''
        
        # Remove leading slash and construct file path
        $cleanPath = $path -replace '^/', ''
        $filePath = Join-Path $folder $cleanPath
        
        if (Test-Path $filePath -PathType Leaf) {
            # Set content type based on file extension
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html" }
                ".css" { $response.ContentType = "text/css" }
                ".js" { $response.ContentType = "application/javascript" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".png" { $response.ContentType = "image/png" }
                ".gif" { $response.ContentType = "image/gif" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $fileBytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
            $response.OutputStream.Flush()
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $bytes = [Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
        }
        
        $response.Close()
    } catch {
        Write-Host "Error: $_"
    }
}
