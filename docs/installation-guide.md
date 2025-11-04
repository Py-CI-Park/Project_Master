# 폐쇄망 프로젝트 관리 시스템 - 설치 가이드

이 문서는 폐쇄망 환경에서 프로젝트 관리 시스템을 설치하는 방법을 안내합니다.

## 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [설치 전 준비사항](#설치-전-준비사항)
3. [Windows 설치](#windows-설치)
4. [Linux 설치](#linux-설치)
5. [초기 설정](#초기-설정)
6. [서버 실행 및 접속](#서버-실행-및-접속)
7. [문제 해결](#문제-해결)
8. [제거 방법](#제거-방법)

---

## 시스템 요구사항

### 최소 요구사항

| 구성 요소 | Windows | Linux |
|-----------|---------|-------|
| **운영체제** | Windows 10 이상 | Ubuntu 20.04+ / CentOS 8+ |
| **CPU** | Intel Core i3 이상 | 동일 |
| **메모리** | 4GB RAM | 4GB RAM |
| **디스크 공간** | 2GB 이상 여유 공간 | 2GB 이상 여유 공간 |
| **Python** | 3.10 이상 | 3.10 이상 |
| **권한** | 관리자 권한 (선택) | sudo 권한 (선택) |

### 권장 요구사항

| 구성 요소 | 권장 사양 |
|-----------|----------|
| **CPU** | Intel Core i5 이상 |
| **메모리** | 8GB RAM |
| **디스크 공간** | 5GB 이상 여유 공간 (로그 및 데이터 저장용) |

---

## 설치 전 준비사항

### 1. Python 설치 확인

#### Windows
```cmd
python --version
```

출력 예시: `Python 3.11.5`

Python이 설치되어 있지 않다면 [python.org](https://www.python.org/downloads/)에서 다운로드하여 설치하세요.

**중요**: 설치 시 "Add Python to PATH" 옵션을 반드시 체크하세요.

#### Linux
```bash
python3 --version
```

Python이 설치되어 있지 않다면:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv

# CentOS/RHEL
sudo yum install python3 python3-pip
```

### 2. 배포 패키지 확인

배포 패키지에 다음 디렉토리와 파일이 포함되어 있는지 확인하세요:

```
Project_Master/
├── deployment/
│   ├── packages/python-wheels/    # 28개의 wheel 파일
│   ├── frontend-build/             # 프론트엔드 빌드 파일
│   ├── database/                   # DB 초기화 스크립트
│   ├── windows/                    # Windows 스크립트
│   └── linux/                      # Linux 스크립트
├── backend/
└── README.md
```

---

## Windows 설치

### 단계 1: 프로젝트 디렉토리로 이동

```cmd
cd C:\path\to\Project_Master
```

**참고**: 경로에 한글이나 공백이 있으면 문제가 발생할 수 있습니다. 영문 경로를 권장합니다.

### 단계 2: 설치 스크립트 실행

```cmd
deployment\windows\install.bat
```

설치 스크립트는 다음 작업을 수행합니다:
1. ✅ Python 버전 확인
2. ✅ 가상 환경 생성 (`backend/venv`)
3. ✅ Python 패키지 설치 (폐쇄망 모드)
4. ✅ 데이터베이스 초기화

### 단계 3: 설치 완료 확인

설치가 완료되면 다음과 같은 메시지가 표시됩니다:

```
================================================================
설치 완료!
================================================================

다음 명령으로 서버를 실행할 수 있습니다:
   deployment\windows\start.bat
```

### 단계 4: 서버 실행

```cmd
deployment\windows\start.bat
```

두 개의 명령 프롬프트 창이 열립니다:
- **Backend API Server** - `http://localhost:8000`
- **Frontend Server** - `http://localhost:5173`

---

## Linux 설치

### 단계 1: 프로젝트 디렉토리로 이동

```bash
cd /path/to/Project_Master
```

### 단계 2: 스크립트 실행 권한 부여

```bash
chmod +x deployment/linux/*.sh
```

### 단계 3: 설치 스크립트 실행

```bash
./deployment/linux/install.sh
```

설치 스크립트는 다음 작업을 수행합니다:
1. ✅ Python 버전 확인
2. ✅ 가상 환경 생성 (`backend/venv`)
3. ✅ Python 패키지 설치 (폐쇄망 모드)
4. ✅ 데이터베이스 초기화

### 단계 4: 설치 완료 확인

설치가 완료되면 다음과 같은 메시지가 표시됩니다:

```
================================================================
설치 완료!
================================================================

다음 명령으로 서버를 실행할 수 있습니다:
   ./deployment/linux/start.sh
```

### 단계 5: 서버 실행

```bash
./deployment/linux/start.sh
```

백그라운드에서 서버가 실행되며, 로그 파일이 생성됩니다:
- `logs/backend.log` - 백엔드 서버 로그
- `logs/frontend.log` - 프론트엔드 서버 로그

### 서버 종료

```bash
./deployment/linux/stop.sh
```

---

## 초기 설정

### 데이터베이스 위치 확인

SQLite 데이터베이스 파일은 다음 위치에 생성됩니다:
```
backend/project_master.db
```

### 데이터베이스 수동 초기화 (필요시)

설치 중 데이터베이스 초기화에 실패한 경우:

#### Windows
```cmd
cd backend
venv\Scripts\activate
python ..\deployment\database\init_db.py
```

#### Linux
```bash
cd backend
source venv/bin/activate
python ../deployment/database/init_db.py
```

---

## 서버 실행 및 접속

### 접속 주소

설치 및 실행 후 다음 주소로 접속할 수 있습니다:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | http://localhost:5173 | 사용자 인터페이스 |
| **백엔드 API** | http://localhost:8000 | REST API 서버 |
| **API 문서** | http://localhost:8000/docs | Swagger UI |
| **API 문서 (ReDoc)** | http://localhost:8000/redoc | ReDoc UI |

### 다른 컴퓨터에서 접속

같은 네트워크의 다른 컴퓨터에서 접속하려면:

1. 서버 컴퓨터의 IP 주소 확인
   - Windows: `ipconfig`
   - Linux: `ip addr` 또는 `ifconfig`

2. 방화벽 설정 (필요시)
   - Windows: 제어판 > Windows Defender 방화벽 > 고급 설정
   - Linux: `sudo ufw allow 8000` 및 `sudo ufw allow 5173`

3. 다른 컴퓨터에서 접속
   ```
   http://[서버IP주소]:5173
   ```

---

## 문제 해결

### 1. Python이 설치되어 있지 않음

**증상**: `python is not recognized` 또는 `python: command not found`

**해결방법**:
- Python 3.10 이상을 설치하세요.
- Windows: 시스템 환경 변수 PATH에 Python 경로 추가
- Linux: 패키지 관리자로 python3 설치

### 2. 가상 환경 생성 실패

**증상**: `venv` 모듈을 찾을 수 없음

**해결방법** (Linux):
```bash
sudo apt install python3-venv
```

### 3. 패키지 설치 실패

**증상**: `deployment/packages/python-wheels` 디렉토리를 찾을 수 없음

**해결방법**:
- 배포 패키지가 완전히 압축 해제되었는지 확인
- 28개의 wheel 파일이 모두 존재하는지 확인

### 4. 데이터베이스 초기화 실패

**증상**: `backend/project_master.db` 파일이 생성되지 않음

**해결방법**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
alembic upgrade head
```

### 5. 포트가 이미 사용 중

**증상**: `Address already in use` 또는 포트 충돌 오류

**해결방법**:

#### Windows
```cmd
# 포트 사용 프로세스 확인
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# 프로세스 종료
taskkill /PID [프로세스ID] /F
```

#### Linux
```bash
# 포트 사용 프로세스 확인
sudo lsof -i :8000
sudo lsof -i :5173

# 프로세스 종료
sudo kill -9 [프로세스ID]
```

### 6. 서버 실행 후 접속 불가

**증상**: 브라우저에서 `localhost:5173` 접속 불가

**체크리스트**:
- [ ] 두 서버(백엔드, 프론트엔드)가 모두 실행 중인지 확인
- [ ] 방화벽이 포트를 차단하지 않는지 확인
- [ ] 브라우저 캐시 삭제 후 재시도
- [ ] 백엔드 서버가 먼저 실행되었는지 확인

### 7. 로그 확인 (Linux)

```bash
# 백엔드 로그
tail -f logs/backend.log

# 프론트엔드 로그
tail -f logs/frontend.log

# 실시간 로그 모니터링
tail -f logs/*.log
```

---

## 제거 방법

### Windows

1. 서버 종료
   - 실행 중인 명령 프롬프트 창 모두 닫기

2. 가상 환경 삭제
   ```cmd
   rmdir /s backend\venv
   ```

3. 데이터베이스 삭제 (선택)
   ```cmd
   del backend\project_master.db
   ```

4. 프로젝트 디렉토리 삭제 (선택)
   ```cmd
   rmdir /s Project_Master
   ```

### Linux

1. 서버 종료
   ```bash
   ./deployment/linux/stop.sh
   ```

2. 가상 환경 및 데이터베이스 삭제
   ```bash
   rm -rf backend/venv
   rm -f backend/project_master.db
   rm -rf logs/
   ```

3. 프로젝트 디렉토리 삭제 (선택)
   ```bash
   cd ..
   rm -rf Project_Master
   ```

---

## 추가 참고 자료

- [배포 가이드](../deployment/README.md) - 폐쇄망 배포 상세 정보
- [데이터베이스 초기화](../deployment/database/README.md) - DB 초기화 상세 안내
- [보안 정보](../backend/SECURITY.md) - 보안 취약점 점검 결과
- [개발 가이드](development-guide.md) - 개발 환경 설정 (개발자용)
- [API 문서](api-documentation.md) - REST API 사용법

---

## 지원

문제가 해결되지 않으면:
1. 로그 파일 확인 (`logs/` 디렉토리)
2. GitHub Issues에 문제 보고
3. [문제 해결 가이드](#문제-해결) 재확인

---

**설치 완료 후 [사용자 매뉴얼](user-manual.md)을 참고하여 시스템을 사용하세요.**
