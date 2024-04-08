import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import * as usersServices from "../services/usersServices.js";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import Jimp from "jimp";
import gravatar from "gravatar";
import { fileURLToPath } from "url";
import path from "path";
import User from "../models/User.js";


const { JWT_SECRET } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarsPath = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await usersServices.findUser({ email });
    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email);

    const newUser = await usersServices.register({...req.body, password: hashPassword, avatarURL});
    res.status(201).json({
        user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
  }
        })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await usersServices.findUser({ email });
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id } = user;

    const payload = {
        id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await usersServices.updateUser({ _id: id }, { token });
    
    res.json({
        token,
        user: {
        email: user.email,
        subscription: user.subscription,
  }
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await usersServices.updateUser({ _id }, { token: "" });
    res.status(204).json();
}

const current = async (req, res) => {
    const { email, subscription } = req.user;
    res.json({
        email,
        subscription,
    })
}

const updateAvatar = async (req, res) => {
    if (!req.file) throw HttpError(400, "No file uploaded");

    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;

    try {
      const image = await Jimp.read(tempUpload);
      await image.resize(250, 250);
      await image.writeAsync(tempUpload);
    } catch (error) {
      throw HttpError(500, "Internal Server Error");
    }

    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarsPath, filename);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
};

export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    current: ctrlWrapper(current),
    updateAvatar: ctrlWrapper(updateAvatar),
}