import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!; // ID чата/канала/группы администратора

export async function sendBookingNotification({
    name,
    phone,
    date,
    time,
    comment,
}: {
    name: string;
    phone: string;
    date: string;
    time: string;
    comment?: string;
}) {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("⚠️ Telegram notifications disabled: missing env vars");
        return;
    }

    const message = `
📅 *Новая бронь*
━━━━━━━━━━━━━━
👤 *Имя:* ${name}
📞 *Телефон:* ${phone}
🕒 *Дата:* ${date}
⏰ *Время:* ${time}
💬 *Комментарий:* ${comment || "—"}
`;

    try {
        const res = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
        });
        return res.data.result.message_id;
    } catch (error) {
        console.error("❌ Ошибка при отправке Telegram уведомления:", error);
    }
}

export const removeBookingNotification = async ({
    messageId
}: {
    messageId: number;
}) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("⚠️ Telegram notifications disabled: missing env vars");
        return;
    }

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            message_id: messageId,
        });
    } catch (error) {
        console.error("❌ Ошибка при удалении Telegram уведомления:", error);
    }
}

export const sendQuickMessageNotification = async ({
    name,
    email,
    message
}: {
    name: string;
    email: string;
    message: string;
}) => {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("⚠️ Telegram notifications disabled: missing env vars");
        return;
    }

    const requestMessage = `
📩 *Новая заявка*
━━━━━━━━━━━━━━
👤 *Имя:* ${name}
📧 *Email:* ${email}
💬 *Сообщение:* ${message || "—"}
`;

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: requestMessage,
            parse_mode: "Markdown",
        });

    } catch (error) {
        console.error("❌ Ошибка при отправке Telegram уведомления:", error);
    }
}