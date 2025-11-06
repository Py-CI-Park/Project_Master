/**
 * WebSocket Service (Socket.IO Client)
 *
 * Socket.IO 클라이언트를 관리하고 실시간 이벤트를 처리합니다.
 * - 자동 재연결
 * - JWT 토큰 인증
 * - 이벤트 리스너 등록/해제
 * - 프로젝트 room 관리
 */

import { io, Socket } from 'socket.io-client';

// WebSocket 서버 URL (환경 변수로 설정 가능)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8099';

/**
 * WebSocket 이벤트 타입 정의
 */
export interface WebSocketEvents {
  // Connection events
  connected: { message: string; user_id: number; username: string };
  user_joined: { user_id: number; username: string; room: string };
  user_left: { user_id: number; username: string; room: string };

  // Project events
  joined_project: { message: string; project_id: number; room: string };
  left_project: { message: string; project_id: number; room: string };
  project_updated: { project: any; timestamp: string };

  // Task events
  task_created: { project_id: number; task: any; timestamp: string };
  task_updated: { project_id: number; task: any; timestamp: string };
  task_deleted: { project_id: number; task_id: number };

  // Dependency events
  dependency_created: { project_id: number; dependency: any };
  dependency_deleted: { project_id: number; dependency_id: number };

  // Attachment events
  attachment_uploaded: { entity_type: string; entity_id: number; attachment: any };
  attachment_deleted: { entity_type: string; entity_id: number; attachment_id: number };

  // Error events
  error: { message: string };
}

/**
 * WebSocket 연결 상태
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
}

/**
 * WebSocket 클라이언트 관리 클래스
 */
class WebSocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private statusListeners: Array<(status: ConnectionStatus) => void> = [];
  private currentProjectId: number | null = null;

  /**
   * Socket.IO 클라이언트 초기화 및 연결
   * @param token - JWT 인증 토큰
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token, // JWT 토큰을 auth 파라미터로 전송
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
    this.setConnectionStatus(ConnectionStatus.CONNECTING);
  }

  /**
   * 기본 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected with ID:', this.socket?.id);
      this.setConnectionStatus(ConnectionStatus.CONNECTED);

      // 재연결 시 프로젝트 room에 자동 재참여
      if (this.currentProjectId !== null) {
        this.joinProject(this.currentProjectId);
      }
    });

    // 연결 해제
    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    });

    // 재연결 시도
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log('[WebSocket] Reconnection attempt:', attempt);
      this.setConnectionStatus(ConnectionStatus.RECONNECTING);
    });

    // 재연결 성공
    this.socket.on('reconnect', (attempt) => {
      console.log('[WebSocket] Reconnected after', attempt, 'attempts');
      this.setConnectionStatus(ConnectionStatus.CONNECTED);
    });

    // 재연결 실패
    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed');
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    });

    // 연결 오류
    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    });

    // 서버로부터 연결 성공 메시지 수신
    this.socket.on('connected', (data) => {
      console.log('[WebSocket] Server confirmed connection:', data);
    });

    // 에러 메시지
    this.socket.on('error', (data) => {
      console.error('[WebSocket] Server error:', data.message);
    });
  }

  /**
   * 연결 해제
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
      this.currentProjectId = null;
    }
  }

  /**
   * 프로젝트 room에 참여
   * @param projectId - 프로젝트 ID
   */
  joinProject(projectId: number): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot join project: not connected');
      return;
    }

    console.log('[WebSocket] Joining project room:', projectId);
    this.socket.emit('join_project', { project_id: projectId });
    this.currentProjectId = projectId;
  }

  /**
   * 프로젝트 room에서 퇴장
   * @param projectId - 프로젝트 ID
   */
  leaveProject(projectId: number): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot leave project: not connected');
      return;
    }

    console.log('[WebSocket] Leaving project room:', projectId);
    this.socket.emit('leave_project', { project_id: projectId });

    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
  }

  /**
   * 이벤트 리스너 등록
   * @param event - 이벤트 이름
   * @param callback - 콜백 함수
   */
  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: (data: WebSocketEvents[K]) => void
  ): void {
    if (!this.socket) {
      console.warn('[WebSocket] Cannot register listener: socket not initialized');
      return;
    }

    this.socket.on(event as string, callback);
  }

  /**
   * 이벤트 리스너 해제
   * @param event - 이벤트 이름
   * @param callback - 콜백 함수 (선택)
   */
  off<K extends keyof WebSocketEvents>(
    event: K,
    callback?: (data: WebSocketEvents[K]) => void
  ): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event as string, callback);
    } else {
      this.socket.off(event as string);
    }
  }

  /**
   * 연결 상태 변경
   */
  private setConnectionStatus(status: ConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * 연결 상태 리스너 등록
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);

    // 즉시 현재 상태 전달
    callback(this.connectionStatus);

    // 구독 해제 함수 반환
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== callback);
    };
  }

  /**
   * 현재 연결 상태 반환
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 현재 참여 중인 프로젝트 ID 반환
   */
  getCurrentProjectId(): number | null {
    return this.currentProjectId;
  }

  /**
   * 연결 여부 반환
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// 싱글톤 인스턴스 생성
const websocketService = new WebSocketService();

export default websocketService;
