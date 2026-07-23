/** Regular Expressions used to detect when certain events occur on the server. */
export interface EventPatternObject {
    /** The server is ready and is listening to RCON connections. */
    rcon: RegExp;
    /** The server was shut down. */
    stop: RegExp;
    /** The server has crashed */
    crash: RegExp;
}

/** Common event patterns. */
const EventPatterns = {
    vanilla: {
        rcon: /^(\[[\d:]*\])?\s*\[[^\]]*INFO\]:\s*RCON\s*running\s*on/i,
        stop: /^(\[[\d:]*\])?\s*\[[^\]]*INFO\]:.*Thread\s*RCON\s*Listener\s*stopped/i,

        crash: /^(\[[\d:]*\])?\s*\[[^\]]*ERROR\]:\s*(Exception\s*stopping\s*the\s*server)|(Encountered\s*an\s*unexpected\s*exception)/i
    } as EventPatternObject,

    paper: {
        rcon: /^(\[[\d:]*\])?\s*\[[^\]]*INFO\]:\s*RCON\s*running\s*on/i,
        stop: /^(\[[\d:]*\])?\s*\[[^\]]*INFO\]:.*Awaiting\s*terminatttion\s*of\s*I\/O\s*pool/i,

        crash: /^(\[[\d:]*\])?\s*\[[^\]]*ERROR\]:\s*(Exception\s*stopping\s*the\s*server)|(Encountered\s*an\s*unexpected\s*exception)/i
    } as EventPatternObject
}

export default EventPatterns;