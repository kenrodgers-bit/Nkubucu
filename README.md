# School Photo Hub

Production-ready MVP for a school photo preview hub built with Next.js 14, MongoDB via Mongoose, Cloudinary, NextAuth.js v5 credentials auth, and Tailwind CSS.

## Prerequisites

- Node.js 18+
- MongoDB Atlas database
- Cloudinary account
- Vercel account for deployment

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Create `.env.local` with:

```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.mongodb.net/school-photo-hub
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NEXTAUTH_SECRET=replace-with-a-long-random-secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-before-production
```

## Seed the First Admin

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `MONGODB_URI`, then run:

```bash
npm run seed
```

The script creates the first admin if it does not exist. Passwords are hashed with bcrypt-compatible hashing at 12 rounds.

## Run

```bash
npm run dev
```

Open `http://localhost:3000` for public album previews and `http://localhost:3000/admin/login` for admin access.

If the homepage says setup is required, create `.env.local` first. The app deliberately refuses to read or write data until MongoDB and Cloudinary variables are configured. MongoDB stores album metadata, preview image URLs, external album links, and provider names. Cloudinary stores preview images only.

## Admin Walkthrough

1. Sign in at `/admin/login`.
2. Create an album from `/admin/albums/new` and paste the external full-album link, such as Google Photos, Google Drive, TeraBox, OneDrive, Dropbox, or another cloud folder.
3. Open the album upload page from the album list.
4. Drag 3 to 5 preview image files into the upload zone.
5. Add class, event, and custom tags.
6. Upload previews. The browser sends the preview images to the protected upload API, which validates them and uploads them to Cloudinary as a single preview batch.
7. Review or delete individual preview photos from `/admin/photos`.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add every environment variable from `.env.example` in the Vercel project settings.
4. Deploy. `next.config.js` is already configured for Cloudinary image delivery.

## Architecture Notes

MongoDB stores metadata only: album fields, preview image URLs, external album URLs, storage providers, preview photo URLs, Cloudinary public IDs, tags, and counts. Binary image files never enter MongoDB.

Only preview images live in Cloudinary under `school-photo-hub/[albumSlug]/`. The upload API enforces 3 to 5 preview images per album, performs server-side validation, uses signed Cloudinary server credentials, stores the original URL and a transformed thumbnail URL, updates `Album.previewImageUrls`, and increments `Album.photoCount`.

Admin pages and `/api/admin/*` endpoints require a NextAuth JWT session. Students do not need accounts; public pages expose album details, preview photos, and a green "Check All Photos" button that opens the external full-album link in a new tab.
