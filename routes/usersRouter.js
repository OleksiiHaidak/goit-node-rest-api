import express from "express";
import usersControllers from "../controllers/usersControllers.js";
import { userRegisterSchema, userLoginSchema, userEmailSchema } from "../schemas/usersSchemas.js";
import validateBody from "../helpers/validateBody.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";


const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userRegisterSchema), usersControllers.register);

usersRouter.get("/verify/:verificationToken", usersControllers.verify);

usersRouter.post("/verify", validateBody(userEmailSchema), usersControllers.resendVerify);

usersRouter.post("/login", validateBody(userLoginSchema), usersControllers.login);

usersRouter.post("/logout", authenticate, usersControllers.logout);

usersRouter.get("/current", authenticate, usersControllers.current);

usersRouter.patch("/avatars", authenticate, upload.single("avatar"), usersControllers.updateAvatar);

export default usersRouter;