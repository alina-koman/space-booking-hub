# Spacebook

Spacebook is a responsive room and equipment booking calendar built with React and
TypeScript. Browse shared resources by day, check availability, and book a room
along with any equipment needed for your meeting.

## Features

- Browse rooms and equipment in separate sections of a daily timeline.
- Search resources and filter them by type or equipment.
- Create a booking with a title, date, time range, room, and optional equipment.
- Reserve multiple devices together with a room in one booking.
- Detect overlapping bookings for every selected resource before saving.
- Open a booking to review its details or cancel it.
- Use consistent colors to identify a booking across the room and equipment rows.
- Keep resources, bookings, and the selected date in browser local storage.

The project uses sample data and local browser storage; it does not require a
backend or account. An admin panel is intentionally not included.

## Getting started

### Requirements

- Node.js and npm

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal after the server starts.

### Production build

```bash
npm run lint
npm run build
npm run preview
```

## Technology

- React 19 and TypeScript
- Vite
- Redux Toolkit and React Redux
- Oxlint

## Project structure

```text
src/
├── app/                 Redux store and typed React Redux hooks
├── components/          Page layout, calendar, filters, and booking dialogs
├── features/
│   ├── bookings/        Booking state, selectors, and date/time utilities
│   ├── filters/         Resource filter state
│   └── resources/       Sample resource data and filtering selector
├── types/
│   ├── booking.ts       Booking model
│   └── resource.ts      Resource model and resource-related types
├── App.css              Application and component styles
├── index.css            Global styles
└── main.tsx             Application entry point and Redux provider
```

## Data persistence

The application saves resources and bookings, including the selected calendar
date, under the `spacebook-state` key in `localStorage`. Saved data is loaded
when the app starts. If the stored data is malformed, Spacebook logs a warning
and falls back to the sample state.
