import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { requireCsrfProtection } from "./middleware/csrf.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import systemRoutes from "./routes/system.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bootstrapRoutes  from "./routes/bootstrap.routes.js";
import usersRoutes from "./routes/users.routes.js";
import auditLogsRoutes from "./routes/auditLogs.routes.js";
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
import remindersRoutes from "./routes/reminders.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";

const app = express();

if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

const allowedOrigins = new Set(env.FRONTEND_ORIGINS);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    exposedHeaders: ["x-request-id"]
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use(requireCsrfProtection);
app.use("/", systemRoutes);
app.use("/auth", authRoutes);
app.use("/auth", bootstrapRoutes);
app.use("/users", usersRoutes);
app.use("/audit-logs", auditLogsRoutes);
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
app.use("/reminders", remindersRoutes);
app.use("/announcements", announcementRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, nodeEnv: env.NODE_ENV }, "API running");
});
