
@echo off
REM Start HTTP server on port 8000
REM Make sure Node.js and http-server are installed
echo Starting local web server on http://localhost:8000
echo Press Ctrl+C to stop the server

npx http-server -p 8000 -o

pause
