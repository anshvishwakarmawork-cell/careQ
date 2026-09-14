/**
 * WebSocket client for real-time CareQueue updates.
 */

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";
let socket = null;
let dispatchFn = null;
let currentTopic = null;

export const initWebSocket = (dispatch) => {
  if (import.meta.env.VITE_USE_MOCK === "true") {
    console.log("[WS] Mock mode enabled. WebSocket is disabled.");
    return;
  }

  dispatchFn = dispatch;
  connect();
};

const connect = () => {
  if (socket?.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("[WS] Connected to Serverless WebSocket");
    if (currentTopic) {
      subscribeToTopic(currentTopic);
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[WS] Received event:", data);
      
      // Dispatch the event as a Redux-like action if it has a type
      if (data.type && dispatchFn) {
        dispatchFn({ type: data.type, payload: data.payload });
      }
    } catch (e) {
      console.error("[WS] Failed to parse message", e);
    }
  };

  socket.onclose = () => {
    console.log("[WS] Disconnected. Reconnecting in 3s...");
    setTimeout(connect, 3000);
  };
};

export const subscribeToTopic = (topicId) => {
  currentTopic = topicId;
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      action: "subscribe",
      topicId
    }));
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};
