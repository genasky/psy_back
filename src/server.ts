import dotenv from "dotenv";
dotenv.config();

import app from "./app";

// Node 20 завершает процесс при необработанном отклонении промисов.
// Ошибка в одном запросе не должна ронять весь API — логируем и продолжаем работать.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
