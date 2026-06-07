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
  status: "draft" | "published" | "hidden";
  isPublic: boolean;
  photoCount: number;
  viewCount: number;
  checkAllClicks: number;
  lastViewedAt?: string;
  lastCheckAllAt?: string;
  externalLinkStatus: "unchecked" | "ok" | "warning" | "error";
  externalLinkCheckedAt?: string;
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
