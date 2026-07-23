export type EventMap = Record<string, any>;

export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (param: T) => void;

export interface EventEmitter<T extends EventMap> {
    on<K extends EventKey<T>>
        (name: K, callback: EventReceiver<T[K]>): void;

    once<K extends EventKey<T>>
        (name: K, callback: EventReceiver<T[K]>): void;    
    
    off<K extends EventKey<T>>
        (name: K, callback: EventReceiver<T[K]>): void;

    emit<K extends EventKey<T>>
        (name: K, data?: T[K]): void;
}

export default function eventEmitter<T extends EventMap>(): EventEmitter<T> {
    const listeners: {
        [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
    } = {};

    return {
        on(key, fn) {
            listeners[key] = (listeners[key] ?? []).concat(fn);
        },

        once(key, fn) {
            const callback = (data: unknown) => {
                const arr = listeners[key];

                const index = arr?.indexOf(callback);
                if (index !== undefined && index !== -1)
                    arr!.splice(index, 1);

                fn(data as any);
            }

            listeners[key] = (listeners[key] ?? []).concat(fn);
        },

        off(key, fn) {
            listeners[key] = (listeners[key] ?? []).filter(f => f !== fn);
        },

        emit(key, data) {
            (listeners[key] ?? []).forEach(function(fn) {
                fn(data);
            });
        }
    }
}