// Where the Settl dashboard runs. "Run the demo" and "Try a live deal" open it.
//
// With `npm start` running, the dashboard is at http://localhost:3000. When this page is served by
// that same server (at /landing, after `npm run build`), the dashboard is simply "/".
// VITE_DASHBOARD_URL overrides both, for a hosted dashboard.
export const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || (window.location.pathname.startsWith('/landing') ? '/' : 'http://localhost:3000/');
