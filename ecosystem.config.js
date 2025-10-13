module.exports = {
    apps: [
        {
            name: "psy_backend",
            script: "./dist/server.js", // или entry point твоего сервера, например server.js или app.js
            cwd: "/home/psy/backend", // путь к папке с backend
            instances: 1, // 1 процесс, можно поставить 0 для cluster mode
            autorestart: true,
            watch: false, // можно true для dev, но в продакшене лучше false
            max_memory_restart: "500M",
        }
    ]
};
