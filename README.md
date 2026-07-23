# Minecraft Java Server
This library helps you run and manage your
Minecraft Java Edition server through a node.js environment.

It is heavily inspired by [@scriptserver/core](https://npmjs.com/package/@scriptserver/core).
I created it after discovering a missing feature in the library, and decided to make my own.

The library utilizes Minecraft's RCON feature, allowing commands to be sent through networking,
receiving the output text through the response.

## Usage
```js
import { MinecraftServer } from 'minecraft-java-server';

// Create a new Minecraft Server
const server = new MinecraftServer({
    eula: true, // Minecraft's eula must be agreed to using this value
    type: 'paper', // Only vanilla and paper are available without custom event patterns (defaults to vanilla)

    serverPath: './paper-server', // Path to the server directory (defaults to ./server)

    // Path to the jarfile (defaults to server.jar in the server directory)
    jarFile: './paper-server/paper.jar',

    // server.properties, omits important values
    properties: {
        "max-players": 10
    },

    stdin: true, // Enables typing commands in the terminal
    stdout: false // If true, outputs the server console to the terminal
});

// Log the server console with a dim color
server.on('console', msg => {
    console.log("\x1b[2m" + msg + "\x1b[0m");
});

// Start the server
server.start().then(async () => {
    console.log("Server started! Banning Herobrine...");

    // Sending commands returns a promise with the result
    const result = await server.send("ban herobrine");
    console.log(result);
});

// Detect when the server stops
server.on('stop', () => {
    console.log("Server stopped.");
});
```

## Important note about RegEx
To detect when certain events occur on the server, such as the server completing startup, or the server shutting down,
Regular Expressions are used on the terminal output.

This can cause issues when the format of status messages changes, such as when using older server versions.

**You may need to define custom event patterns in this case.**
When doing so, ensure that you use the `^` anchor, to avoid players being able to fire these events on accident.

```js
import MinecraftServer, { EventPatterns } from 'minecraft-java-server';
const server = new MinecraftServer({
    // ...
    eventPatterns: {
        ...EventPatterns.vanilla,
        // A console line must match this pattern for the 'start' event to fire
        start: /^(\[[\d:]*\])?\s*\[[^\]]*INFO\]:\s*RCON\s*running\s*on/
    }
})
```