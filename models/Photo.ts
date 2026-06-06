import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const photoSchema = new Schema(
  {
    albumId: {
      type: Schema.Types.ObjectId,
      ref: "Album",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    classTag: {
      type: String,
      default: "",
      trim: true,
    },
    eventTag: {
      type: String,
      default: "",
      trim: true,
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
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    versionKey: false,
  },
);

export type PhotoDocument = InferSchemaType<typeof photoSchema>;

export default (mongoose.models.Photo as Model<PhotoDocument>) ??
  mongoose.model("Photo", photoSchema);
