# Khanut Front-End

A Next.js application for the Khanut platform - a local business finder service.

## Overview

Khanut is a platform that connects customers with local businesses and services. This repository contains the front-end application built with Next.js, React, and TypeScript.

## Features

- Customer-based search routes for better state management
- Business and service discovery
- User authentication and profiles
- Review system for services
- Real-time notifications
- Interactive maps for business locations
- Responsive design for all devices

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zod](https://zod.dev/) - Schema validation
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [React Map GL](https://visgl.github.io/react-map-gl/) - Map integration
- [Recharts](https://recharts.org/) - Data visualization

## Getting Started

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared code
- `/public` - Static assets
- `/styles` - Global styles
- `/types` - TypeScript type definitions
- `/services` - API service integrations

## Related Services

- [Khanut Back-End](https://github.com/kidusshoa/khanut-back-end) - API endpoints
- [Recommendation Service](https://github.com/kidusshoa/recommendation-service) - Personalized business recommendations

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Deployment

The application is configured for deployment on Vercel. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
