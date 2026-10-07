@echo off
echo ============================================
echo   AlumniConnect - Start All Services
echo ============================================

:: 1. Start PostgreSQL service
echo [1/3] Starting PostgreSQL...
net start postgresql-x64-17 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL already running or service name differs, trying alternate name...
    net start postgresql 2>nul
)
timeout /t 3 /nobreak >nul

:: 2. Create DB if not exists
echo [2/3] Creating database if needed...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "SELECT 1 FROM pg_database WHERE datname='alumni_db';" | find "1 row" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE alumni_db;"
    echo Database created!
) ELSE (
    echo Database already exists.
)

:: 3. Start Spring Boot backend
echo [3/3] Starting Spring Boot Backend...
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot
set MVN="C:\Users\HAMEED\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0\bin\mvn.cmd"
start "AlumniConnect Backend" cmd /k "cd /d %~dp0backend && %MVN% spring-boot:run"

:: 4. Open frontend
echo Opening frontend in browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo ============================================
echo   Done! Backend starting at :8080
echo   Frontend running at :3000
echo ============================================
pause
