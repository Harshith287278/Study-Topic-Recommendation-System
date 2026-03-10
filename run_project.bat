@echo off
echo Starting STUDY PATH...
echo.

:: Check for Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java not found. Please install Java to run the backend.
) else (
    echo Compiling recommendation.java...
    javac recommendation.java
    if %errorlevel% neq 0 (
        echo [ERROR] Compilation failed.
    ) else (
        echo Starting Java Backend on http://localhost:8080...
        start /b java recommendation
    )
)

echo.
echo Opening Application...
start index.html

echo.
echo System is up and running!
pause
