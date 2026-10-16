import * as dgram from 'dgram'
import { DateTime } from 'luxon'
import { Payload, Level, LoggerInstance } from './Logger'

export default class Logstash implements LoggerInstance {
  protected host: string
  protected port: number
  protected socket!: dgram.Socket

  public constructor(host: string, port: number) {
    this.host = host
    this.port = port

    this.createSocket()
  }

  protected createSocket() {
    this.socket = dgram.createSocket('udp4')
  }

  public async send(level: Level, message: string, payload?: Payload): Promise<void> {
    const params = {
      '@timestamp': DateTime.now().toISO(),
      ...payload,
      message,
      level,
    }

    const buffer = Buffer.from(JSON.stringify(params))
    const length = buffer.length

    this.socket.ref()
    this.socket.send(buffer, 0, length, this.port, this.host, () => {
      this.socket.unref()
    })
  }
}
