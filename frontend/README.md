This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Status: Phase 3 (Public Catalog)

### Completed Features
- **Design System**: Global Tailwind v4 configuration, Fonts (Inter/Outfit).
- **Landing Page**: Full responsive implementation.
- **Authentication**: Login, Register (Supabase Auth), Middleware protection.
- **Infrastructure**: Connection verified with FastAPI Backend and Supabase.
- **Catalog**: Live Course Catalog fetching from Supabase.

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Key Pages
- `http://localhost:3000/` - Landing Page
- `http://localhost:3000/courses` - Course Catalog
- `http://localhost:3000/dashboard` - User Dashboard (Requires Login)
- `http://localhost:3000/system-check` - Connection Diagnostics

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
