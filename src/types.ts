export type ConnectionError = Error & { code?: string };
export type RSU = Record<string, unknown>;

export type {
    EventEmitter,
    EventKey,
    EventMap,
    EventReceiver
} from './eventEmitter';

export type {
    EventPatternObject
} from './eventPatterns';

export type {
    RconConfig,
    RconPromise
} from './rcon';

export type {
    MinecraftServerEvents
} from './server';

export type {
    ServerConfig
} from './serverConfig';

export type {
    SafeServerProperties,
    ServerProperties
} from './serverProperties';