@echo off
title GradeSystem — Student Grade Tracker
echo ================================================
echo   Starting GradeSystem on http://localhost:3000
echo ================================================

cd /d "%~dp0"

echo Compiling server...
javac SimpleServer.java
if %errorlevel% neq 0 (
    echo [ERROR] Compilation failed. Make sure Java 17+ is installed.
    pause
    exit /b 1
)

echo Opening browser...
start http://localhost:3000

echo Starting server...
java SimpleServer

pause
