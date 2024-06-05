import express from "express";
import {registerCtrl, loginCtrl, logoutCtrl, userProfileCtrl, updateProfileCtrl, profileImageUploadCtrl} from "../../controllers/user/controller";
import authenticate from "../../middlewares/authenticate";
import uploadMiddleware from "../../middlewares/uploadImage";

const upload = uploadMiddleware("profilePictures");

const userApiRoutes = express.Router();

// Register
userApiRoutes.post("/register", registerCtrl);

//Login
userApiRoutes.post("/login", loginCtrl);

//Logout
userApiRoutes.post("/logout", authenticate, logoutCtrl);

//Update Profile Info
userApiRoutes.post("/update", authenticate, updateProfileCtrl);

//Profile Info
userApiRoutes.get("/", authenticate, userProfileCtrl);

//Profile photo upload
userApiRoutes.post("/profile-photo-upload", authenticate, upload.single("profile"), profileImageUploadCtrl);

export default userApiRoutes;
