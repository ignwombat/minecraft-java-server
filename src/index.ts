import MinecraftServer from './server';

// Export everything
export default MinecraftServer;
export { default as addObjectDefaults } from './addObjectDefaults';
export { RconRequestId, RconRequestType, RconResponseType } from './enum';
export { default as eventEmitter } from './eventEmitter';
export { default as EventPatterns } from './eventPatterns';
export { loadEula, loadServerProperties } from './loader';
export { default as Rcon, encode, decode } from './rcon';
export { addServerConfigDefaults, defaultServerConfig } from './serverConfig';
export { defaultServerProperties } from './serverProperties';

// Export all types
export type {
    ConnectionError,
    RSU,

    EventEmitter,
    EventKey,
    EventMap,
    EventReceiver,

    EventPatternObject,

    RconConfig,
    RconPromise,

    MinecraftServerEvents,

    ServerConfig,
    
    SafeServerProperties as ServerProperties
} from './types';