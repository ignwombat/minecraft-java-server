// Types
import type { RSU } from './types';

/**
 * Adds default properties to a partial object.
 * Does NOT write to the object.
 * @returns Clone with defaults added.
*/
export default function addObjectDefaults<T extends Object>(init: Partial<T>, defaults: T) {
    const loadObject = <OT extends Object>(obj: Partial<OT>, defaultObj: OT) => {
        for (const key in defaultObj) {
            const value = obj[key];
            const defaultValue = defaultObj[key];

            if (value === undefined) {
                (obj as RSU)[key] = defaultValue;
                continue;
            }

            if (typeof defaultValue === 'object')
                loadObject(
                    value as RSU,
                    defaultValue as RSU
                );
        }

        return obj;
    }

    return loadObject<T>(
        structuredClone(init),
        defaults
    ) as T;
}