import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import * as usersServices from "../services/usersServices.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const register = async (req, res) => {
    const { email, password } = req.body;
    const user = await usersServices.findUser({ email });
    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await usersServices.register({...req.body, password: hashPassword});
    res.status(201).json({
        user: {
        email: newUser.email,
        subscription: newUser.subscription,
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

export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    logout: ctrlWrapper(logout),
    current: ctrlWrapper(current),
}