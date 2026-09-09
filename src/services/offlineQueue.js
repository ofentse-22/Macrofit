const QUEUE_KEY = "fitlab-offline-queue";
const EVENT_NAME = "fitlab-offline-queue-changed";

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function getQueueSize() {
  return readQueue().length;
}

export function enqueue(operation) {
  const queue = readQueue();
  const queuedOperation = {
    ...operation,
    id: crypto.randomUUID(),
    clientId: operation.clientId || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  writeQueue([...queue, queuedOperation]);
  return queuedOperation;
}

function findQueuedCreate(queue, clientId) {
  return queue.findIndex((operation) => (
    operation.clientId === clientId
    && (operation.type === "nutritionLog" || operation.type === "weightLog")
  ));
}

export function updateQueuedCreate(clientId, updates) {
  const queue = readQueue();
  const index = findQueuedCreate(queue, clientId);
  if (index < 0) return false;
  queue[index] = { ...queue[index], payload: { ...queue[index].payload, ...updates } };
  writeQueue(queue);
  return true;
}

export function cancelQueuedCreate(clientId) {
  const queue = readQueue();
  const index = findQueuedCreate(queue, clientId);
  if (index < 0) return false;
  queue.splice(index, 1);
  writeQueue(queue);
  return true;
}

export async function flushQueue(handlers) {
  if (!navigator.onLine) return;
  const queue = readQueue();
  if (!queue.length) return;

  const remaining = [];
  for (const operation of queue) {
    try {
      const handler = handlers[operation.type];
      if (!handler) throw new Error(`Unsupported offline operation: ${operation.type}`);
      await handler(operation.payload);
    } catch {
      remaining.push(operation);
    }
  }
  writeQueue(remaining);
}

export function subscribeQueue(callback) {
  const update = () => callback(getQueueSize());
  window.addEventListener(EVENT_NAME, update);
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  return () => {
    window.removeEventListener(EVENT_NAME, update);
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  };
}
