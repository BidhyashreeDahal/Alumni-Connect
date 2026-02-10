import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import bootstrapRoutes  from "./routes/bootstrap.routes.js";
import usersRoutes from "./routes/users.routes.js";
import profileRoutes from "./routes/profile.routes.js";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/auth", bootstrapRoutes);
app.use("/users", usersRoutes);
app.use("/profiles", profileRoutes);


app.listen(process.env.PORT || 5000, () => {
  console.log(`API running on port ${process.env.PORT || 5000}`);
});
