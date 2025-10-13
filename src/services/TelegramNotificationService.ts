import axios from "axios";

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
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!; // ID чата/канала/группы администратора

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
    console.log('hello')

    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
        });

        console.log('hello1')
    } catch (error) {
        console.error("❌ Ошибка при отправке Telegram уведомления:", error);
    }
}
