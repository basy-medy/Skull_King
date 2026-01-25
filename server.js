const server = Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
        
        const file = Bun.file(import.meta.dir + filePath);
        
        if (await file.exists()) {
            return new Response(file);
        }
        
        return new Response('Not Found', { status: 404 });
    },
});

console.log(`🎮 Skull King server running at http://localhost:${server.port}`);
