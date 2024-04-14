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
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";


const { JWT_SECRET, SENDGRID_FROM, PROJECT_URL } = process.env;

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
    const verificationToken = nanoid();

    const avatarURL = gravatar.url(email);

    const newUser = await usersServices.register({...req.body, password: hashPassword, avatarURL, verificationToken});

    const verifyEmail = {
        to: email,
        from: SENDGRID_FROM,
        subject: 'Verify email',
        text: 'Verify email',
        html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}">Click to verify email</a>`,
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL: newUser.avatarURL,
  }
    })
}

const verify = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await usersServices.findUser({ verificationToken });
    if (!user) {
        throw HttpError(404, "User not found");
    }
    await usersServices.updateUser({ _id: user._id }, { verify: true, verificationToken: "" })
    
    res.json({message: "Verification successful"})
}

const resendVerify = async (req, res) => { 
    const { email } = req.body;
    const user = await usersServices.findUser({ email });
    if (!user) {
        throw HttpError(404, "User not found");
    }
    if (user.verify) {
        throw HttpError(400, "Verification has already been passed");
    }

    const verifyEmail = {
        to: email,
        from: SENDGRID_FROM,
        subject: 'Verify email',
        text: 'Verify email',
        html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationToken}">Click to verify email</a>`,
    }
    await sendEmail(verifyEmail);

    res.json({message: "Verification email sent"})
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await usersServices.findUser({ email });
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
        throw HttpError(401, "Email not verify");
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
    verify: ctrlWrapper(verify),
    resendVerify: ctrlWrapper(resendVerify),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    current: ctrlWrapper(current),
    updateAvatar: ctrlWrapper(updateAvatar),
}