import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: process.env.NODE_ENV === "production" ? 465 : 587,
    secure: process.env.NODE_ENV === "production" ? true : false,
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    },
});

export default {
    sendVerificationEmail: async (id: string, email: string, token: string) => {
        await transporter.sendMail({
            from: `"PSY" <${process.env.NODEMAILER_EMAIL!}>`,
            to: email,
            subject: "Подтвердите ваш адрес электронной почты",
            text: `Пожалуйста, подтвердите ваш адрес электронной почты, перейдя по ссылке: ${process.env.CLIENT_URL}/auth/verify/${id}/${token}`,
        });
    },
    sendResetPasswordEmail: async (id: string, email: string, token: string) => {
        await transporter.sendMail({
            from: `"PSY" <${process.env.NODEMAILER_EMAIL!}>`,
            to: email,
            subject: "Сброс пароля",
            text: `Для сброса пароля перейдите по ссылке: ${process.env.CLIENT_URL}/auth/reset-password/${id}/${token}`,
        });
    }
}
