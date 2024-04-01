import Joi from "joi";

import { emailRegepxp } from "../constants/user-constants.js";

export const userRegisterSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().pattern(emailRegepxp).required(),
})

export const userLoginSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().pattern(emailRegepxp).required(),
})