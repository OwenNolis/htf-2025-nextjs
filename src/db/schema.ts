import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// User table
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Session table
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// Account table
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// Verification table
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// User fish sightings table - stores individual sightings with location data
export const userFishSighting = sqliteTable("user_fish_sighting", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fishId: text("fishId").notNull(), // Fish ID from external API
  latitude: text("latitude"), // Optional: user-reported latitude as string for precision
  longitude: text("longitude"), // Optional: user-reported longitude as string for precision
  sightingDate: integer("sightingDate", { mode: "timestamp" }).notNull(), // Date of the sighting
  spottedAt: integer("spottedAt", { mode: "timestamp" }), // Legacy field for migration compatibility
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

// User fish images table - stores user-uploaded images for fish
export const userFishImage = sqliteTable("user_fish_image", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fishId: text("fishId").notNull(), // Fish ID from external API
  imageUrl: text("imageUrl").notNull(), // URL or path to the uploaded image
  caption: text("caption"), // Optional caption for the image
  takenAt: integer("takenAt", { mode: "timestamp" }), // When the photo was taken
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});
