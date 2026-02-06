type MessageHandler = (data: any) => void;

let ws: WebSocket | null = null;
let handlers: Set<MessageHandler> = new Set();
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

function getWsUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  ws = new WebSocket(getWsUrl());

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handlers.forEach((h) => h(data));
    } catch {}
  };

  ws.onclose = () => {
    reconnectTimeout = setTimeout(connect, 2000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

export function subscribe(handler: MessageHandler) {
  handlers.add(handler);
  connect();
  return () => {
    handlers.delete(handler);
  };
}

export function sendMessage(data: any) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}
