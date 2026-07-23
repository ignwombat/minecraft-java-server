// Net
import Net, { Socket } from 'node:net';

// Types
import type { ConnectionError } from './types';

// Local
import {
    RconRequestType,
    RconRequestId,
    RconResponseType
} from './enum';
import { defaultServerConfig } from './serverConfig';

import eventEmitter from './eventEmitter';
import addObjectDefaults from './addObjectDefaults';

/** Encodes a string body into a network buffer. */
export function encode(
    type: RconRequestType,
    id: RconRequestId,
    body: string
): Buffer<ArrayBuffer> {
    const size = Buffer.byteLength(body) + 14;
    const buffer = Buffer.alloc(size);

    buffer.writeInt32LE(size - 4, 0);
    buffer.writeInt32LE(id, 4);
    buffer.writeInt32LE(type, 8);
    buffer.write(body, 12, size - 2);
    buffer.writeInt16LE(0, size - 2);

    return buffer;
}

/** Decodes a network chunk. */
export function decode(chunk: Uint8Array): {
    size: number;
    id: RconRequestId;
    type: number;
    body: string;
} {
    const buffer = Buffer.from(chunk);

    return {
        size: buffer.readInt32LE(0),
        id: buffer.readInt32LE(4),
        type: buffer.readInt32LE(8),
        body: buffer.toString('utf8', 12, buffer.length - 1)
    }
}

export type RconPromise = [(value: string) => void, (error: string) => void];

/** Remote Connection Configuration */
export interface RconConfig {
    /**
     * Server Address the remote connection should use.
     * @default 'localhost'
    */
    host: string;

    /**
     * Port to use for the remote connection.
     * @default 25575
    */
    port: number;

    /**
     * Password for the remote connection.
     * @default 'randomly-generated-password'
    */
    password: string;
    
    /**
     * Buffer delay in milliseconds.
     * Queue will be backed up and sent all at once every X milliseconds.
     * @default 200
    */
    bufferMilliseconds?: number;
}

export default class Rcon {
    public config: RconConfig;

    private socket?: Socket;
    private authenticated: boolean = false;

    private queue: [string, ...RconPromise][] = [];
    private promises: { [execId: number]: RconPromise } = {};
    private execId: number = RconRequestId.Exec;

    private tickInterval?: NodeJS.Timeout;
    
    private emitter = eventEmitter<{
        connect: void;
        disconnect: void;
        error: string;
        warn: string;
    }>();

    public on = this.emitter.on;
    public off = this.emitter.off;
    public once = this.emitter.once;
    
    private nextExecId() {
        return (this.execId += 1);
    }
    
    private listen() {
        this.socket?.on('data', chunk => {
            const packet = decode(chunk as Buffer);
            
            switch(packet.type) {
                case RconResponseType.Auth:
                    this.authenticated = true;
                    this.emitter.emit('connect');
                    break;
                    
                case RconResponseType.Exec:
                    this.promises[packet.id]?.[0](packet.body);
                    break;
                    
                default:
                    console.warn('Unknown packet type\n', packet);
                    break;
            }
        });
    }
                
    private tick() {
        if (this.socket && this.authenticated && this.queue.length) {
            const queue = this.queue.shift();
            if (!queue) return;

            const msg: string = queue[0];
            const resolve = queue[1];
            const reject = queue[2];

            const execId = this.nextExecId();
            this.promises[execId] = [resolve, reject];
            
            this.socket.write(
                encode(RconRequestType.Exec, execId, msg)
            );
        }
    }
    
    public send(msg: string) {
        return new Promise<string>((res, rej) => {
            this.queue.push([msg, res, rej]);
        });
    }

    public connect(maxAttempts: number = 10, attempts: number = 0) {
        if (this.authenticated) return;
        this.socket?.destroy();

        attempts += 1;

        this.socket = Net.connect({
            host: this.config.host,
            port: this.config.port
        }, () => {
            this.listen();
            this.socket?.write(
                encode(
                    RconRequestType.Auth,
                    RconRequestId.Auth,
                    this.config.password
                )
            );
        });

        this.socket.on('error', (err: ConnectionError) => {
            if (maxAttempts && err.code === 'ECONNREFUSED') {
                if (attempts > maxAttempts) return this.emitter.emit('error', `Failed to connect ${maxAttempts} times`);

                this.emitter.emit('warn', 'Failed to connect. Retrying...');
                return setTimeout(() => this.connect(maxAttempts, attempts), 500);
            }

            this.emitter.emit('error', `Failed to connect: ${err.message}`);
        });

        this.tickInterval && clearInterval(this.tickInterval);
        this.tickInterval = setInterval(
            () => this.tick(),
            this.config.bufferMilliseconds
        );
    }

    public disconnect() {
        this.socket?.destroy();
        this.socket = undefined;

        this.authenticated = false;

        this.queue = [];
        this.promises = {};

        this.tickInterval && clearInterval(this.tickInterval);

        for (const key in this.promises) {
            this.promises[key][1]?.('Disconnected');
        }

        this.queue.forEach(promise => promise[2]('Disconnected'));
        this.emitter.emit('disconnect');
    }

    constructor(config: RconConfig) {
        this.config = addObjectDefaults<RconConfig>(
            config,
            defaultServerConfig.rcon!
        );
    }
}