import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const albumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    term: {
      type: String,
      enum: ["1", "2", "3"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    externalAlbumUrl: {
      type: String,
      required: true,
      trim: true,
    },
    storageProvider: {
      type: String,
      required: true,
      trim: true,
    },
    previewImageUrls: {
      type: [String],
      default: [],
    },
    coverImageUrl: {
      type: String,
      default: "",
    },
    coverCloudinaryId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "hidden"],
      default: "draft",
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    photoCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    checkAllClicks: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },
    lastCheckAllAt: {
      type: Date,
    },
    externalLinkStatus: {
      type: String,
      enum: ["unchecked", "ok", "warning", "error"],
      default: "unchecked",
    },
    externalLinkCheckedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type AlbumDocument = InferSchemaType<typeof albumSchema>;

export default (mongoose.models.Album as Model<AlbumDocument>) ??
  mongoose.model("Album", albumSchema);
