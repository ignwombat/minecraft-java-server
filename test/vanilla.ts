import MinecraftServer from 'minecraft-java-server';

// Create a new Minecraft Server
const server = new MinecraftServer({
    eula: true,
    serverPath: './vanilla-server',
    jarFile: './jarfiles/vanilla.jar',
    stdout: false
});

// Log the console with a dim color
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