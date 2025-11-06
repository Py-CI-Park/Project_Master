/**
 * useWebSocket Hook
 *
 * WebSocket 연결 및 실시간 이벤트를 관리하는 React Hook
 * - 자동 연결/해제
 * - 프로젝트 room 관리
 * - 실시간 이벤트 리스닝
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService, { ConnectionStatus } from '../services/websocket';
import type { WebSocketEvents } from '../services/websocket';
import { useAuthStore } from '../stores/authStore';

/**
 * WebSocket Hook 옵션
 */
interface UseWebSocketOptions {
  /** 자동 연결 여부 (기본: true) */
  autoConnect?: boolean;
  /** 프로젝트 ID (자동으로 room 참여) */
  projectId?: number | null;
}

/**
 * WebSocket Hook 반환 타입
 */
interface UseWebSocketReturn {
  /** 연결 상태 */
  connectionStatus: ConnectionStatus;
  /** 연결 여부 */
  isConnected: boolean;
  /** 수동 연결 함수 */
  connect: () => void;
  /** 연결 해제 함수 */
  disconnect: () => void;
  /** 프로젝트 참여 함수 */
  joinProject: (projectId: number) => void;
  /** 프로젝트 퇴장 함수 */
  leaveProject: (projectId: number) => void;
  /** 이벤트 리스너 등록 함수 */
  on: <K extends keyof WebSocketEvents>(
    event: K,
    callback: (data: WebSocketEvents[K]) => void
  ) => void;
  /** 이벤트 리스너 해제 함수 */
  off: <K extends keyof WebSocketEvents>(
    event: K,
    callback?: (data: WebSocketEvents[K]) => void
  ) => void;
}

/**
 * WebSocket Hook
 *
 * @param options - Hook 옵션
 * @returns WebSocket 연결 상태 및 제어 함수
 *
 * @example
 * ```tsx
 * const { isConnected, joinProject, on, off } = useWebSocket({
 *   projectId: 1,
 * });
 *
 * useEffect(() => {
 *   const handleTaskUpdated = (data) => {
 *     console.log('Task updated:', data);
 *   };
 *
 *   on('task_updated', handleTaskUpdated);
 *
 *   return () => {
 *     off('task_updated', handleTaskUpdated);
 *   };
 * }, [on, off]);
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, projectId = null } = options;

  const { accessToken, isAuthenticated } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [isConnected, setIsConnected] = useState(false);

  // 현재 참여 중인 프로젝트 ID 추적
  const currentProjectIdRef = useRef<number | null>(null);

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      console.warn('[useWebSocket] Cannot connect: not authenticated');
      return;
    }

    if (websocketService.isConnected()) {
      console.log('[useWebSocket] Already connected');
      return;
    }

    websocketService.connect(accessToken);
  }, [accessToken, isAuthenticated]);

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    currentProjectIdRef.current = null;
  }, []);

  /**
   * 프로젝트 참여
   */
  const joinProject = useCallback((pid: number) => {
    if (currentProjectIdRef.current === pid) {
      console.log('[useWebSocket] Already in project room:', pid);
      return;
    }

    // 이전 프로젝트에서 퇴장
    if (currentProjectIdRef.current !== null) {
      websocketService.leaveProject(currentProjectIdRef.current);
    }

    // 새 프로젝트에 참여
    websocketService.joinProject(pid);
    currentProjectIdRef.current = pid;
  }, []);

  /**
   * 프로젝트 퇴장
   */
  const leaveProject = useCallback((pid: number) => {
    websocketService.leaveProject(pid);

    if (currentProjectIdRef.current === pid) {
      currentProjectIdRef.current = null;
    }
  }, []);

  /**
   * 이벤트 리스너 등록
   */
  const on = useCallback(
    <K extends keyof WebSocketEvents>(
      event: K,
      callback: (data: WebSocketEvents[K]) => void
    ) => {
      websocketService.on(event, callback);
    },
    []
  );

  /**
   * 이벤트 리스너 해제
   */
  const off = useCallback(
    <K extends keyof WebSocketEvents>(
      event: K,
      callback?: (data: WebSocketEvents[K]) => void
    ) => {
      websocketService.off(event, callback);
    },
    []
  );

  /**
   * 연결 상태 구독
   */
  useEffect(() => {
    const unsubscribe = websocketService.onStatusChange((status) => {
      setConnectionStatus(status);
      setIsConnected(status === ConnectionStatus.CONNECTED);
    });

    return unsubscribe;
  }, []);

  /**
   * 자동 연결
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && accessToken && !websocketService.isConnected()) {
      connect();
    }

    // cleanup 시 연결 해제
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, isAuthenticated, accessToken]);

  /**
   * 프로젝트 자동 참여
   */
  useEffect(() => {
    if (projectId !== null && isConnected) {
      joinProject(projectId);
    }

    // cleanup 시 프로젝트 퇴장
    return () => {
      if (projectId !== null && currentProjectIdRef.current === projectId) {
        leaveProject(projectId);
      }
    };
  }, [projectId, isConnected, joinProject, leaveProject]);

  return {
    connectionStatus,
    isConnected,
    connect,
    disconnect,
    joinProject,
    leaveProject,
    on,
    off,
  };
}

/**
 * 프로젝트별 실시간 업데이트를 위한 Hook
 *
 * @param projectId - 프로젝트 ID
 * @param callbacks - 이벤트 콜백 함수들
 *
 * @example
 * ```tsx
 * useProjectWebSocket(projectId, {
 *   onTaskCreated: (data) => {
 *     // 태스크 생성 처리
 *   },
 *   onTaskUpdated: (data) => {
 *     // 태스크 업데이트 처리
 *   },
 * });
 * ```
 */
export function useProjectWebSocket(
  projectId: number | null,
  callbacks: {
    onTaskCreated?: (data: WebSocketEvents['task_created']) => void;
    onTaskUpdated?: (data: WebSocketEvents['task_updated']) => void;
    onTaskDeleted?: (data: WebSocketEvents['task_deleted']) => void;
    onProjectUpdated?: (data: WebSocketEvents['project_updated']) => void;
    onDependencyCreated?: (data: WebSocketEvents['dependency_created']) => void;
    onDependencyDeleted?: (data: WebSocketEvents['dependency_deleted']) => void;
    onAttachmentUploaded?: (data: WebSocketEvents['attachment_uploaded']) => void;
    onAttachmentDeleted?: (data: WebSocketEvents['attachment_deleted']) => void;
    onUserJoined?: (data: WebSocketEvents['user_joined']) => void;
    onUserLeft?: (data: WebSocketEvents['user_left']) => void;
  } = {}
) {
  const { isConnected, on, off } = useWebSocket({
    projectId,
  });

  useEffect(() => {
    if (!isConnected) return;

    // 이벤트 리스너 등록
    if (callbacks.onTaskCreated) {
      on('task_created', callbacks.onTaskCreated);
    }
    if (callbacks.onTaskUpdated) {
      on('task_updated', callbacks.onTaskUpdated);
    }
    if (callbacks.onTaskDeleted) {
      on('task_deleted', callbacks.onTaskDeleted);
    }
    if (callbacks.onProjectUpdated) {
      on('project_updated', callbacks.onProjectUpdated);
    }
    if (callbacks.onDependencyCreated) {
      on('dependency_created', callbacks.onDependencyCreated);
    }
    if (callbacks.onDependencyDeleted) {
      on('dependency_deleted', callbacks.onDependencyDeleted);
    }
    if (callbacks.onAttachmentUploaded) {
      on('attachment_uploaded', callbacks.onAttachmentUploaded);
    }
    if (callbacks.onAttachmentDeleted) {
      on('attachment_deleted', callbacks.onAttachmentDeleted);
    }
    if (callbacks.onUserJoined) {
      on('user_joined', callbacks.onUserJoined);
    }
    if (callbacks.onUserLeft) {
      on('user_left', callbacks.onUserLeft);
    }

    // cleanup 시 이벤트 리스너 해제
    return () => {
      if (callbacks.onTaskCreated) {
        off('task_created', callbacks.onTaskCreated);
      }
      if (callbacks.onTaskUpdated) {
        off('task_updated', callbacks.onTaskUpdated);
      }
      if (callbacks.onTaskDeleted) {
        off('task_deleted', callbacks.onTaskDeleted);
      }
      if (callbacks.onProjectUpdated) {
        off('project_updated', callbacks.onProjectUpdated);
      }
      if (callbacks.onDependencyCreated) {
        off('dependency_created', callbacks.onDependencyCreated);
      }
      if (callbacks.onDependencyDeleted) {
        off('dependency_deleted', callbacks.onDependencyDeleted);
      }
      if (callbacks.onAttachmentUploaded) {
        off('attachment_uploaded', callbacks.onAttachmentUploaded);
      }
      if (callbacks.onAttachmentDeleted) {
        off('attachment_deleted', callbacks.onAttachmentDeleted);
      }
      if (callbacks.onUserJoined) {
        off('user_joined', callbacks.onUserJoined);
      }
      if (callbacks.onUserLeft) {
        off('user_left', callbacks.onUserLeft);
      }
    };
  }, [isConnected, callbacks, on, off]);

  return { isConnected };
}
