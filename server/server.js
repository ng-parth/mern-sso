require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoute = require("./routes/auth");
const passportMiddleware = require("./passport");
const connectDB = require('./configs/db')
const app = express();

passportMiddleware.initialize(app);
connectDB().then();

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use("/auth", (req, res, next) => {
	console.log('auth req-url: ', req.method, req.url );
	console.log('auth req-body: ', req.body);
	// console.log('auth res: ', res);
	next();
}, authRoute);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listenting on port ${port}...`));
