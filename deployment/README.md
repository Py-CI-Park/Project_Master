# 배포 디렉토리

폐쇄망 환경 배포를 위한 설치 스크립트 및 패키지 저장소입니다.

## 디렉토리 구조

```
deployment/
├── windows/              # Windows 설치 스크립트
│   ├── install.bat       # 설치 스크립트 (향후 추가)
│   ├── start.bat         # 실행 스크립트 (향후 추가)
│   └── uninstall.bat     # 제거 스크립트 (향후 추가)
├── linux/                # Linux 설치 스크립트
│   ├── install.sh        # 설치 스크립트 (향후 추가)
│   ├── start.sh          # 실행 스크립트 (향후 추가)
│   └── uninstall.sh      # 제거 스크립트 (향후 추가)
├── packages/             # 오프라인 패키지 저장소
│   ├── python-wheels/    # Python 패키지 (wheel 파일)
│   └── node-modules-cache/ # Node.js 패키지
└── database/             # 데이터베이스 초기화 스크립트
    └── init.sql          # 초기 데이터 (향후 추가)
```

## 사용 방법

Phase 5에서 작성될 설치 스크립트를 통해 폐쇄망 환경에서 애플리케이션을 설치하고 실행할 수 있습니다.

자세한 내용은 Phase 5 완료 후 업데이트됩니다.
