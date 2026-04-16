@echo off
chcp 949 > nul
setlocal

set RELEASE_DIR=release

echo === Choose One 빌드 시작 ===
echo.

REM 1. TypeScript 컴파일
echo [1/3] TypeScript 컴파일 중...
call npm run build
if %errorlevel% neq 0 (
    echo [오류] TypeScript 컴파일 실패
    exit /b 1
)

REM 2. release 폴더 초기화
echo [2/3] release 폴더 초기화...
if exist %RELEASE_DIR% rd /s /q %RELEASE_DIR%
md %RELEASE_DIR%

REM 3. 실행 필수 파일만 복사
echo [3/3] 파일 복사 중...
copy index.html %RELEASE_DIR%\index.html > nul
xcopy /e /i /q dist %RELEASE_DIR%\dist > nul

echo.
echo === 빌드 완료 ===
echo 릴리즈 파일: .\%RELEASE_DIR%\
echo.
echo 실행 방법:
echo   cd %RELEASE_DIR%
echo   python -m http.server 8001
echo   브라우저: http://localhost:8001

endlocal
