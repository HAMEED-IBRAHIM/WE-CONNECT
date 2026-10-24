@echo off
title WE-CONNECT Starter
echo ============================================
echo   WE-CONNECT - Starting All Services
echo ============================================

:: Ensure Node, Java and Maven paths are available in PATH
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot\bin;C:\Users\HAMEED\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin"
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot"

:: 1. Start Spring Boot Backend (:8080)
echo [1/2] Starting Spring Boot Backend...
start "WE-CONNECT Backend (Port 8080)" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

:: 2. Start React Frontend (:3000)
echo [2/2] Starting React Frontend...
start "WE-CONNECT Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm start"

echo ============================================
echo   Both services are launching!
echo   - Backend:  http://localhost:8080/api
echo   - Frontend: http://localhost:3000
echo.
echo   * React takes ~15 seconds to compile.
echo   Opening browser now...
echo ============================================

timeout /t 6 /nobreak >nul
start http://localhost:3000
pause
