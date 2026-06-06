export type Album = {
  id: string;
  title: string;
  slug: string;
  term: "1" | "2" | "3";
  year: number;
  eventName: string;
  description: string;
  externalAlbumUrl: string;
  storageProvider: string;
  previewImageUrls: string[];
  coverImageUrl: string;
  coverCloudinaryId: string;
  isPublic: boolean;
  photoCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Photo = {
  id: string;
  albumId: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  tags: string[];
  classTag: string;
  eventTag: string;
  term: "1" | "2" | "3";
  year: number;
  uploadedAt: string;
};

export type PaginationState = {
  page: number;
  limit: number;
  totalPhotos: number;
  totalPages: number;
};
