"""
보안 관련 유틸리티 함수
- JWT 토큰 생성 및 검증
- 비밀번호 해싱 및 검증
"""
from datetime import datetime, timedelta
from typing import Any, Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext

# JWT 설정
SECRET_KEY = "your-secret-key-here-change-in-production-min-32-characters"  # TODO: 환경변수로 변경
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # 30분
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7일

# 비밀번호 해싱 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================================================
# 비밀번호 해싱
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    평문 비밀번호와 해시된 비밀번호를 비교

    Args:
        plain_password: 평문 비밀번호
        hashed_password: 해시된 비밀번호

    Returns:
        bool: 일치 여부
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    비밀번호를 bcrypt로 해싱

    Args:
        password: 평문 비밀번호

    Returns:
        str: 해시된 비밀번호
    """
    return pwd_context.hash(password)


# ============================================================================
# JWT 토큰 생성
# ============================================================================

def create_access_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Access Token 생성

    Args:
        subject: 토큰 주제 (일반적으로 사용자명 또는 사용자 ID)
        expires_delta: 만료 시간 (None이면 기본값 30분)

    Returns:
        str: JWT 토큰
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Refresh Token 생성

    Args:
        subject: 토큰 주제 (일반적으로 사용자명 또는 사용자 ID)
        expires_delta: 만료 시간 (None이면 기본값 7일)

    Returns:
        str: JWT 리프레시 토큰
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ============================================================================
# JWT 토큰 검증
# ============================================================================

def decode_token(token: str) -> Optional[dict]:
    """
    JWT 토큰 디코딩 및 검증

    Args:
        token: JWT 토큰

    Returns:
        dict | None: 토큰 페이로드 또는 None (검증 실패 시)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_token(token: str) -> Optional[str]:
    """
    토큰 검증 및 사용자명 추출

    Args:
        token: JWT 토큰

    Returns:
        str | None: 사용자명 또는 None (검증 실패 시)
    """
    payload = decode_token(token)
    if payload is None:
        return None

    username: str = payload.get("sub")
    if username is None:
        return None

    return username


def verify_refresh_token(token: str) -> Optional[str]:
    """
    리프레시 토큰 검증 및 사용자명 추출

    Args:
        token: JWT 리프레시 토큰

    Returns:
        str | None: 사용자명 또는 None (검증 실패 시)
    """
    payload = decode_token(token)
    if payload is None:
        return None

    # 리프레시 토큰인지 확인
    token_type = payload.get("type")
    if token_type != "refresh":
        return None

    username: str = payload.get("sub")
    if username is None:
        return None

    return username


# ============================================================================
# 토큰 만료 시간 확인
# ============================================================================

def get_token_expiration(token: str) -> Optional[datetime]:
    """
    토큰 만료 시간 조회

    Args:
        token: JWT 토큰

    Returns:
        datetime | None: 만료 시간 또는 None (검증 실패 시)
    """
    payload = decode_token(token)
    if payload is None:
        return None

    exp_timestamp = payload.get("exp")
    if exp_timestamp is None:
        return None

    return datetime.fromtimestamp(exp_timestamp)


def is_token_expired(token: str) -> bool:
    """
    토큰 만료 여부 확인

    Args:
        token: JWT 토큰

    Returns:
        bool: 만료 여부 (True: 만료됨, False: 유효함)
    """
    expiration = get_token_expiration(token)
    if expiration is None:
        return True  # 토큰이 유효하지 않으면 만료로 간주

    return datetime.utcnow() > expiration
