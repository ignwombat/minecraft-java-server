// Path
import { join } from 'path';

// FS
import { statSync, readFileSync, writeFileSync } from 'node:fs';

// Types
import type {
    RSU,
    ServerConfig,
    ServerProperties
} from './types';

// Local
import addObjectDefaults from './addObjectDefaults';
import { defaultServerProperties } from './serverProperties';

const safeStat = (path: string) => {
    try {
        return statSync(path);
    } catch {}
}

export function loadEula(config: ServerConfig) {
    const filePath = join(config.serverPath!, 'eula.txt');

    writeFileSync(filePath, `eula=${config.eula === true}`, {
        flag: 'w',
        encoding: 'utf-8'
    });
}

const vitalKeys: Record<string, string> = {
    port: 'server-port',
    rcon: 'rcon.port',
    password: 'rcon.password',
    enableRcon: 'enable-rcon'
};

export function loadServerProperties(config: ServerConfig) {
    const filePath = join(config.serverPath!, 'server.properties');

    const serverProperties: Partial<Record<keyof ServerProperties, any>> = addObjectDefaults(
        {},
        defaultServerProperties as RSU
    );

    const vitalProperties = {
        port: config.port,
        rcon: config.rcon?.port,
        password: config.rcon?.password,
        enableRcon: true
    };

    if (typeof config.properties === 'object')
        for (const key in config.properties) {
            (serverProperties as RSU)[key] = (config.properties as RSU)[key];
        }
    
    for (const key in vitalKeys) {
        (serverProperties as RSU)[vitalKeys[key]] = (vitalProperties as RSU)[key];
    }

    // If the server.properties file already exists, only overwrite relevant properties
    if (safeStat(filePath)?.isFile()) {
        let content = readFileSync(filePath, 'utf8');

        for (const key in serverProperties) {
            const value = (serverProperties as RSU)[key];
            const pattern = new RegExp(`(^|\r?\n)${key}=[^\r\n]*`);

            // If the key exists, replace the value
            if (pattern.test(content))
                content = content.replace(pattern, `$1${key}=${value}`);
            else
                content += content.length
                    ? `\n${key}=${value}`
                    : `${key}=${value}`;
        }

        writeFileSync(
            filePath,
            content,
            {
                flag: 'w',
                encoding: 'utf8'
            }
        );
    }

    else writeFileSync(
        filePath,
        Object.keys(serverProperties)
            .map(key => `${key}=${(serverProperties as RSU)[key] ?? ''}`)
            .join('\n'),
        {
            flag: 'w',
            encoding: 'utf-8'
        }
    );
}