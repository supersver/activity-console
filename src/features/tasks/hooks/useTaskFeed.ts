"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { taskEventReceived, wsStatusChanged } from "../store/tasksSlice";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

function getWsUrl() {
  const configured = process.env.NEXT_PUBLIC_WS_URL;
  if (!configured) return "ws://localhost:4000/ws";
  return configured.endsWith("/ws") ? configured : `${configured}/ws`;
}

export function useTaskFeed() {
  const dispatch = useAppDispatch();
  const attemptRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      dispatch(wsStatusChanged("connecting"));
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0; // reset backoff on a clean connection
        dispatch(wsStatusChanged("open"));
      };

      ws.onmessage = (event) => {
        try {
          dispatch(taskEventReceived(JSON.parse(event.data)));
        } catch {
          console.warn("[useTaskFeed] non-JSON message, ignored", event.data);
        }
      };

      ws.onerror = () => {
        dispatch(wsStatusChanged("error"));
      };

      ws.onclose = () => {
        dispatch(wsStatusChanged("closed"));
        if (unmountedRef.current) return; // don't reconnect after unmount
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** attemptRef.current,
          RECONNECT_MAX_MS,
        );
        attemptRef.current += 1;
        setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, [dispatch]);
}
