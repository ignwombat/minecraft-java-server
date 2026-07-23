// Path
import { join } from 'node:path';

// FS
import { mkdirSync, statSync } from 'node:fs';

// Child Process
import { spawn, type ChildProcess } from 'node:child_process';

// Types
import type {
    RSU,
    ServerConfig
} from './types';

// Local
import eventEmitter, { EventKey } from './eventEmitter';
import Rcon from './rcon';

import { loadEula, loadServerProperties } from './loader';
import { addServerConfigDefaults } from './serverConfig';

const safeStat = (path: string) => {
    try {
        return statSync(path);
    } catch {}
}

export interface MinecraftServerEvents {
    console: string;

    rcon: void; // The server has started listening to RCON connections
    start: void; // The server has started, and RCON has successfully connected
    stop: void; // The server has stopped
    crash: void; // The server has crashed
}

export default class MinecraftServer {
    public config: ServerConfig;
    public childProcess?: ChildProcess;
    public rcon: Rcon;

    private emitter = eventEmitter<MinecraftServerEvents>();

    public on = this.emitter.on;
    public once = this.emitter.once;
    public off = this.emitter.off;

    public started = false;
    public crashed = false;

    public start(): Promise<MinecraftServer> {
        this.crashed = false;
        if (this.childProcess) throw new Error('Server already running');

        // Create the server directory
        mkdirSync(this.config.serverPath!, { recursive: true });

        if (!safeStat(this.config.jarFile!)?.isFile())
            throw new Error(`Jarfile '${this.config.jarFile}' does not exist`);

        loadEula(this.config);
        loadServerProperties(this.config);

        let promise = new Promise<MinecraftServer>(res => {
            this.once('rcon', () => {
                setTimeout(() => { this.rcon!.connect(); }, 500);

                this.rcon!.once('connect', () => {
                    this.started = true;
                    this.emitter.emit('start');
                    res(this);
                });
            });
        });

        this.once('stop', () => {
            this.started = false;
            this.rcon!.disconnect();

            this.config.stdin && process.stdin.unpipe();

            this.childProcess?.kill('SIGKILL');
            this.childProcess = undefined;
        });

        this.once('crash', () => {
            this.started = false;
            this.crashed = true;

            this.config.stdin && process.stdin.unpipe();

            this.rcon!.disconnect();
            this.childProcess?.kill('SIGKILL');
            this.childProcess = undefined;
        });

        this.childProcess = spawn(
            this.config.javaExecutable!,
            [
                ...(this.config.execArgs ?? []),
                '-jar',
                this.config.jarFile!,
                'nogui'
            ],
            {
                cwd: this.config.serverPath,
                stdio: 'pipe',
                detached: false
            }
        );

        this.childProcess.on('exit', exitCode => {
            this.started = false;
            this.rcon!.disconnect();

            this.config.stdin && process.stdin.unpipe();

            if (exitCode === 0) {
                this.emitter.emit('stop');
            }

            else {
                this.crashed = true;
                this.emitter.emit('crash');
            }
        });

        this.config.stdin && process.stdin.pipe(this.childProcess.stdin!);

        this.childProcess.stdout?.on('data', (chunk: Buffer) => {
            this.config.stdout && process.stdout.write(chunk);

            chunk
                .toString()
                .trim()
                .split(/\r?\n/g)
                .forEach(msg => {
                    // Emit to console
                    this.emitter.emit('console', msg);

                    // Handle event patterns
                    const eventPatterns = this.config.eventPatterns!;

                    for (const key in eventPatterns) {
                        const pattern = (eventPatterns as unknown as RSU)[key] as RegExp;
                        if (msg.match(pattern))
                            switch(key) {
                                case 'rcon':
                                    !this.started && this.emitter.emit('rcon');
                                    break;
                                case 'stop':
                                    this.started && this.emitter.emit('stop');
                                    break;
                                case 'crash':
                                    !this.crashed && this.emitter.emit('crash');
                                    break;
                                default:
                                    this.emitter.emit(
                                        key as EventKey<MinecraftServerEvents>,
                                        msg
                                    );
                                    break;
                            }
                    }
                });
        });

        if (this.config.gracefulShutdown) {
            let stopping = false;
            const shutdownListener = async () => {
                if (stopping) return;
                stopping = true;

                await this.stop();
                this.childProcess?.killed && this.childProcess?.kill();

                console.log();
                process.exit(0);
            }

            process.on('SIGTERM', shutdownListener);
            process.on('SIGINT', shutdownListener);

            this.on('stop', () => {
                process.off('SIGTERM', shutdownListener);
                process.off('SIGINT', shutdownListener);
            });
        }

        return promise;
    }

    public stop(): Promise<MinecraftServer> {
        let resolve: (server: MinecraftServer) => void;
        
        const promise = new Promise<MinecraftServer>(res => {
            resolve = res;
            this.once('stop', () => res(this));
        });
        
        this.send('stop')
            .catch(() => {
                this.childProcess?.kill();
                resolve(this);
            });

        return promise;
    }

    public send(msg: string): Promise<string> {
        if (!this.childProcess) throw new Error('Server not running');
        return this.rcon!.send(msg);
    }

    constructor(config: ServerConfig) {
        this.config = addServerConfigDefaults(config);
        this.rcon = new Rcon(this.config.rcon!);

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.send = this.send.bind(this);
    }
}