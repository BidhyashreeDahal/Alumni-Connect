import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import bootstrapRoutes  from "./routes/bootstrap.routes.js";
import usersRoutes from "./routes/users.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import invitesRoutes from "./routes/invites.routes.js";
import mentorshipRoutes from "./routes/mentorship.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import directoryRoutes from "./routes/directory.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import studentRoutes from "./routes/students.routes.js";
import eventRoutes from "./routes/events.routes.js";
import alumniRoutes from "./routes/alumni.routes.js"
import importRoutes from "./routes/import.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import profilePhotoRoutes from "./routes/profilePhoto.routes.js";

dotenv.config();
const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/auth", bootstrapRoutes);
app.use("/users", usersRoutes);
app.use("/profiles", profileRoutes);
app.use("/students", studentRoutes);
app.use("/alumni",alumniRoutes );
app.use("/invites", invitesRoutes);
app.use("/mentorship", mentorshipRoutes);
app.use("/notes", notesRoutes);
app.use("/directory", directoryRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/events", eventRoutes);
app.use("/bulk-import", importRoutes);
app.use("/settings", settingsRoutes);
app.use("/profile-photo", profilePhotoRoutes);

app.listen(process.env.PORT || 5000, () => {
  console.log(`API running on port ${process.env.PORT || 5000}`);
});
