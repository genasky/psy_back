import axios from "axios";
import {IUser} from "../models/User";
import {SMSLog} from "../models/SMSLog";


export const sendSmsVerification = async (phone: string, code: string) => {
    try {
        const res = await axios.post("https://app.sms.by/api/v1/sendQuickSMS", {}, {
            params: {
                token: process.env.SMSBY_TOKEN ?? "",
                message: `Ваш верификационный код: ${code}`,
                phone,
                alphaname_id: '6168',
            }
        })

        if (res.status === 200) {
            const smsLog = new SMSLog({
                sms_id: res.data.sms_id,
                status: res.data.status,
                parts: res.data.parts,
            })

            await smsLog.save()
        }
    } catch (e) {
        console.error(e);
    }
}