@echo off
chcp 949 > nul
setlocal

set RELEASE_DIR=release

echo === Choose One ���� ���� ===
echo.

REM 1. TypeScript ������
echo [1/3] TypeScript ������ ��...
call npm run build
if %errorlevel% neq 0 (
    echo [����] TypeScript ������ ����
    exit /b 1
)

REM 2. release ���� �ʱ�ȭ
echo [2/3] release ���� �ʱ�ȭ...
if exist %RELEASE_DIR% rd /s /q %RELEASE_DIR%
md %RELEASE_DIR%

REM 3. ���� �ʼ� ���ϸ� ����
echo [3/3] ���� ���� ��...
copy index.html %RELEASE_DIR%\index.html > nul
md %RELEASE_DIR%\dist
copy dist\bundle.js %RELEASE_DIR%\dist\bundle.js > nul

echo.
echo === ���� �Ϸ� ===
echo ������ ����: .\%RELEASE_DIR%\
echo.
echo ���� ���:
echo   cd %RELEASE_DIR%
echo   python -m http.server 8001
echo   ������: http://localhost:8001

endlocal
