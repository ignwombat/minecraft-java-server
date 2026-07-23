/** Minecraft Server Properties. */
export interface ServerProperties {
    /** Whether this server accepts transfers from other servers. */
    'accepts-transfers'?: boolean;

    /** Whether players can fly without being kicked. */
    'allow-flight'?: boolean;

    /** Whether console commands are broadcast to operators. */
    'broadcast-console-to-ops'?: boolean;

    /** Whether RCON commands are broadcast to operators. */
    'broadcast-rcon-to-ops'?: boolean;

    /** URL where players can report bugs. */
    'bug-report-link'?: string;

    /** Enables debug mode. */
    'debug'?: boolean;

    /** World difficulty. */
    difficulty?: 'peaceful' | 'easy' | 'normal' | 'hard';

    /** Enables the code of conduct. */
    'enable-code-of-conduct'?: boolean;

    /** Enables JMX monitoring. */
    'enable-jmx-monitoring'?: boolean;

    /** Enables the GameSpy4 query protocol. */
    'enable-query'?: boolean;

    /** Enables RCON. */
    'enable-rcon'?: boolean;

    /** Whether the server responds to status pings. */
    'enable-status'?: boolean;

    /** Enforces secure player profiles. */
    'enforce-secure-profile'?: boolean;

    /** Enforces the whitelist. */
    'enforce-whitelist'?: boolean;

    /** Entity tracking range percentage. */
    'entity-broadcast-range-percentage'?: number;

    /** Forces players into the default gamemode on join. */
    'force-gamemode'?: boolean;

    /** Maximum permission level for functions. */
    'function-permission-level'?: 1 | 2 | 3 | 4;

    /** Default gamemode. */
    gamemode?: 'survival' | 'creative' | 'adventure' | 'spectator';

    /** Whether structures generate. */
    'generate-structures'?: boolean;

    /** World generator settings (JSON). */
    'generator-settings'?: string;

    /** Enables hardcore mode. */
    hardcore?: boolean;

    /** Hides online players in the server status response. */
    'hide-online-players'?: boolean;

    /** Datapacks disabled on world creation. */
    'initial-disabled-packs'?: string;

    /** Datapacks enabled on world creation. */
    'initial-enabled-packs'?: string;

    /** World folder name. */
    'level-name'?: string;

    /** World seed. */
    'level-seed'?: string;

    /** World preset/type. */
    'level-type'?: string;

    /** Whether player IPs are logged. */
    'log-ips'?: boolean;

    /** Allowed origins for the management server. */
    'management-server-allowed-origins'?: string;

    /** Enables the management server. */
    'management-server-enabled'?: boolean;

    /** Management server host. */
    'management-server-host'?: string;

    /** Management server port. */
    'management-server-port'?: number;

    /** Shared secret for the management server. */
    'management-server-secret'?: string;

    /** Enables TLS for the management server. */
    'management-server-tls-enabled'?: boolean;

    /** TLS keystore path. */
    'management-server-tls-keystore'?: string;

    /** TLS keystore password. */
    'management-server-tls-keystore-password'?: string;

    /** Maximum chained neighbor updates. */
    'max-chained-neighbor-updates'?: number;

    /** Maximum number of players. */
    'max-players'?: number;

    /** Maximum tick time in milliseconds. */
    'max-tick-time'?: number;

    /** Maximum world size. */
    'max-world-size'?: number;

    /**
     * Message of the Day.
     * It is recommended to use the [MOTD Creator](https://mctools.org/motd-creator).
    */
    motd?: string;

    /** Compression threshold in bytes. */
    'network-compression-threshold'?: number;

    /** Whether authentication with Mojang is required. */
    'online-mode'?: boolean;

    /** Default operator permission level. */
    'op-permission-level'?: 1 | 2 | 3 | 4;

    /** Seconds before the server pauses when empty (-1 disables). */
    'pause-when-empty-seconds'?: number;

    /** Minutes before idle players are kicked. */
    'player-idle-timeout'?: number;

    /** Prevents proxy connections. */
    'prevent-proxy-connections'?: boolean;

    /** Query protocol port. */
    'query.port'?: number;

    /** Connection rate limit. */
    'rate-limit'?: number;

    /** RCON password. */
    'rcon.password'?: string;

    /** RCON port. */
    'rcon.port'?: number;

    /** Region file compression algorithm. */
    'region-file-compression'?: 'deflate' | 'lz4' | 'none';

    /** Whether a resource pack is required. */
    'require-resource-pack'?: boolean;

    /** Resource pack URL. */
    'resource-pack'?: string;

    /** Resource pack UUID. */
    'resource-pack-id'?: string;

    /** Resource pack prompt shown to players. */
    'resource-pack-prompt'?: string;

    /** SHA-1 hash of the resource pack. */
    'resource-pack-sha1'?: string;

    /** IP address to bind to. */
    'server-ip'?: string;

    /** Network port the server should be hosted from. */
    'server-port'?: number;

    /** Simulation distance in chunks. */
    'simulation-distance'?: number;

    /** Spawn protection radius. Non-admin players will not be able to interact with blocks in this radius. */
    'spawn-protection'?: number;

    /** Status heartbeat interval. */
    'status-heartbeat-interval'?: number;

    /** Whether chunk writes are synchronous. */
    'sync-chunk-writes'?: boolean;

    /** Text filtering configuration. */
    'text-filtering-config'?: string;

    /** Text filtering API version. */
    'text-filtering-version'?: number;

    /** Whether to use native transport. */
    'use-native-transport'?: boolean;

    /** View distance in chunks. */
    'view-distance'?: number;

    /** Enables the whitelist. */
    'white-list'?: boolean;
}

/** Safe Minecraft Server Properties. */
export type SafeServerProperties = Omit<
    ServerProperties,
    | 'enable-rcon'
    | 'rcon.port'
    | 'rcon.password'
    | 'server-port'
>;

/** Default Minecraft Server Properties. Differs from the vanilla defaults slightly. */
export const defaultServerProperties: Partial<ServerProperties> = {
    'max-players': 32,
    'spawn-protection': 0,
    'simulation-distance': 12,
    'view-distance': 16,

    motd: "\\u00A7f\\u00A7kNODEJS\\u00A7r \\u00A7aA \\u00A76\\u00A7l\\u00A7nNode.js\\u00A7r \\u00A7aServer \\u00A7f\\u00A7kNODEJS\\u00A7r\\n=============================="
};