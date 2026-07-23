/** Remote Connection Request Type */
export enum RconRequestType {
    Auth = 0x03,
    Exec = 0x02
}

/** Remote Connection Request ID */
export enum RconRequestId {
    Auth = 0x123,
    Exec = 0x321
}

/** Remote Connection Response Type */
export enum RconResponseType {
    Auth = 0x02,
    Exec = 0x00
}