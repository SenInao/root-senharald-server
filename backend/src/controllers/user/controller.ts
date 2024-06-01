import { Request, Response} from "express";
import User from "../../models/user";
import bcrypt from "bcryptjs";
import { stringify } from "querystring";

export const registerCtrl = async (req: Request, res: Response) => {
	const {fullname, username, email, password} = req.body;

	if (req.session.userAuth) {
		res.status(400).send("already logged in");
		return;
	};

	if (!fullname || !username || !email || !password) {
		res.status(400).send("Please provide all required information");
		return;
	};

	try {
		const emailTaken = await User.findOne({email});
		const usernameTaken = await User.findOne({username});

		if (emailTaken || usernameTaken) {
			res.status(400).send("email or username in use");
			return;
		};

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const user = await User.create({
			fullname,
			username,
			email,
			password: hash,
		});

		user.save({validateBeforeSave: false});

		res.status(200).send("Success");
		return;
	} catch (error) {
		console.log(error);
		res.status(400).send("server error");
		return;
	};
};

export const loginCtrl = async (req: Request, res: Response) => {
	const {username, password} = req.body;

	if (req.session.userAuth) {
		res.status(400).send("already logged in");
		return;
	};

	if (!username || !password) {
		res.status(400).send("Please provide all information");
		return;
	};

	try {
		const userFound = await User.findOne({username});

		if (!userFound) {
			res.status(400).send("Wrong username");
			return;
		};

		const correctPassword = await bcrypt.compare(password, userFound.password);

		if (!correctPassword) {
			res.status(400).send("Wrong password");
			return;
		};

		req.session.userAuth = userFound.id;

		res.status(200).send("Success");
		return;
	} catch (error) {
		console.log(error);
		res.status(400).send("server error");
		return;
	};
};

export const logoutCtrl = async (req: Request, res: Response) => {
	req.session.userAuth = null;
	res.status(200).send("logged out");
	return;
};

export const userProfileCtrl = async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.session.userAuth);

		if (!user) {
			res.status(400).send("user not found");
			return;
		};

		res.status(200).json(user);
		return;

	} catch (error) {
		console.log(error);
		res.status(400).send("server error");
		return;
	};
};

export const updateProfileCtrl = async (req: Request, res: Response) => {
	const {username, fullname, email} = req.body;

	if (!username || !fullname || !email) {
		res.status(400).send("please provide updated info");
		return;
	};

	try {
		const emailTaken = await User.findOne({email});
		const usernameTaken = await User.findOne({username});

		if (emailTaken) {
			res.status(400).send("email taken!");
			return;
		} else if (usernameTaken) {
			res.status(400).send("username taken!");
			return;
		};

		const user = await User.findByIdAndUpdate(
			req.session.userAuth,
			{
				fullname,
				username,
				email
			},
			{new: true}
		);
		
		res.status(200).json(user);
		
	} catch (error) {
		console.log(error);
		res.status(400).send("server error");
		return;
	};
};
