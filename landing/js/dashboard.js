// Where the Settl dashboard runs. "Run the demo" and "Try a live deal" open it.
//
// The Settl server serves this page at / and the dashboard at /app/, so normally the
// dashboard is on the same site. While this page is being worked on with `npm run dev`
// it runs on its own port, and the dashboard is the Settl server on port 3000.
// VITE_DASHBOARD_URL overrides both.
export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || (window.location.port === '5173' ? 'http://localhost:3000/app/' : '/app/');
