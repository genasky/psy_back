import express from "express";
import axios from "axios";
import User from "../models/User";

const router = express.Router();

router.get("/:googleId", async (req, res) => {
  try {
    const { googleId } = req.params;
    // достаёшь из базы user.avatar
    const user = await User.findOne({ googleId });
    if (!user?.avatar) return res.sendStatus(404);

    // получаем изображение с Google CDN
    const response = await axios.get(user.avatar, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0", // имитация браузера
        Referer: "https://accounts.google.com",
      },
    });

    res.set("Content-Type", "image/jpeg");
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching avatar" });
  }
});

export default router;