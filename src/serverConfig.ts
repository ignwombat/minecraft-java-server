// Path
import { join } from 'node:path';

// Child Process
import { type SpawnOptions } from 'node:child_process';

// Crypto
import { randomBytes } from 'node:crypto';

// Types
import type {
    EventPatternObject,
    RconConfig,
    SafeServerProperties,
    ServerProperties
} from './types';

// Local
import addObjectDefaults from './addObjectDefaults';
import EventPatterns from './eventPatterns';

/** Server Configuration. */
export interface ServerConfig {
    /**
     * Regular Expressions used to detect when certain events occur on the server.
     * @default EventPatterns.Vanilla
    */
    eventPatterns?: EventPatternObject;

    /** You must agree to the [End User License Agreement](https://www.minecraft.net/en-us/eula). */
    eula: boolean;

    /**
     * Additional args to pass to the command line.
     * **`-Xms` and `-Xmx` are both handled by `minRam` and `maxRam`**
    */
    execArgs?: string[];

    /**
     * Allows the server to gracefully shut down when SIGTERM/SIGINT (ctrl+c) is sent.
     * @default true
    */
    gracefulShutdown?: boolean;

    /**
     * Path to the server jarfile
     * @default join(serverPath, 'server.jar')
    */
    jarFile?: string;

    /**
     * Path to the Java executable.
     * Useful for running older server versions, such as modded, which may rely on Java 8.
     * @default 'java'
    */
    javaExecutable?: string;

    /**
     * Maximum amount of RAM the server may use.
     * Gets passed into the `-Xmx` argument.
     * @default '4G' // 4 Gigabytes
    */
    maxRam?: string;

    /**
     * Amount of RAM the server will reserve.
     * Gets passed into the `-Xms` argument.
    */
    minRam?: string;

    /**
     * Network port the server should be hosted from.
     * @default 25565
    */
    port?: ServerProperties['server-port'];
    
    /** Raw Server Properties. Omits important values. */
    properties?: SafeServerProperties;

    /** Remote Connection Configuration. */
    rcon?: RconConfig;
    
    /**
     * Path to the root directory of the server. Should point to the directory that would contain the 'world' folder.
     * @default './server' // relative to the current working directory.
    */
    serverPath?: string;

    /**
     * Pipes the terminal input into the server console, allowing you to type commands
     * @default true
    */
    stdin?: boolean;

    /**
     * Pipes the server console into the terminal
     * @default true
    */
    stdout?: boolean;

    /** Some common server types have default event patterns. */
    type?: 'vanilla'|'paper';
}

/** Default server config. Does not include required values. */
export const defaultServerConfig: Partial<ServerConfig> = {
    gracefulShutdown: true,
    jarFile: 'server.jar',
    javaExecutable: 'java',
    maxRam: '4G',
    port: 25565,
    rcon: {
        host: 'localhost',
        port: 25575,
        password: randomBytes(32).toString('hex'),
        bufferMilliseconds: 200
    },
    stdin: true,
    stdout: true
};

const relativePathRegex = /^\.{1,2}[\/\\]/;
export function addServerConfigDefaults(
    config: Partial<ServerConfig>
): ServerConfig {
    const newConfig = addObjectDefaults(config, defaultServerConfig);

    newConfig.eventPatterns ??= EventPatterns[config.type ?? 'vanilla'] ?? EventPatterns.vanilla;

    const cwd = process.cwd();
    newConfig.serverPath ??= join(cwd, 'server');
    newConfig.jarFile ??= join(newConfig.serverPath, 'server.jar');

    // Check for relative paths
    if (relativePathRegex.test(newConfig.serverPath))
        newConfig.serverPath = join(cwd, newConfig.serverPath);

    if (relativePathRegex.test(newConfig.jarFile))
        newConfig.jarFile = join(cwd, newConfig.jarFile);

    if (relativePathRegex.test(newConfig.javaExecutable!))
        newConfig.javaExecutable = join(cwd, newConfig.javaExecutable!);

    return newConfig as ServerConfig;
};