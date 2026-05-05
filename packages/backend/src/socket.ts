import { WebSocketServer, type WebSocket } from 'ws'
import { EventBus } from '@neurova/core'
import type { Server as HttpServer } from 'node:http'

export type SocketEvents = {
  connection: { client: SocketClient }
  disconnect: { client: SocketClient }
  message: { client: SocketClient; data: unknown }
}

export interface SocketClient {
  id: string
  send: (data: unknown) => void
  close: () => void
}

export interface SocketHubOptions {
  server: HttpServer
  path?: string
}

/**
 * Lightweight WebSocket hub on top of `ws`. Use for streaming model output,
 * presence, or live UI updates.
 */
export class SocketHub {
  readonly events = new EventBus<SocketEvents>()
  private wss: WebSocketServer
  private clients = new Map<string, WebSocket>()

  constructor(opts: SocketHubOptions) {
    this.wss = new WebSocketServer({ server: opts.server, path: opts.path ?? '/ws' })
    this.wss.on('connection', (socket) => {
      const id = `c_${Math.random().toString(36).slice(2, 10)}`
      this.clients.set(id, socket)
      const client: SocketClient = {
        id,
        send: (data) =>
          socket.readyState === socket.OPEN
            ? socket.send(typeof data === 'string' ? data : JSON.stringify(data))
            : undefined,
        close: () => socket.close(),
      }
      this.events.emit('connection', { client })
      socket.on('message', (raw) => {
        let data: unknown = raw.toString()
        try {
          data = JSON.parse(raw.toString())
        } catch {
          /* keep as string */
        }
        this.events.emit('message', { client, data })
      })
      socket.on('close', () => {
        this.clients.delete(id)
        this.events.emit('disconnect', { client })
      })
    })
  }

  broadcast(data: unknown): void {
    const payload = typeof data === 'string' ? data : JSON.stringify(data)
    for (const ws of this.clients.values()) {
      if (ws.readyState === ws.OPEN) ws.send(payload)
    }
  }

  close(): void {
    this.wss.close()
  }
}
