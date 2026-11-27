window.SUPABASE_URL = "https://ojpoegtnksfumvepxdpj.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcG9lZ3Rua3NmdW12ZXB4ZHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzk2MDcsImV4cCI6MjA5NDYxNTYwN30.4uMgWfOjZ8kbdtILT1uRD3DFPkL2Wd8OwBPhaRpRhQU";

var SUPABASE_URL = window.SUPABASE_URL;
var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

// Alias for the JAPANOFFER_* names used by auth.js, admin.js, analytics.js,
// report.js, ai-match.js, jobs.js, profile.js, applications.js and
// global-search.js. Previously these readers got `undefined` because only
// the SUPABASE_* names were set, which broke sign-up, the account page,
// analytics, report saving and the admin dashboard. The SUPABASE_* names
// are kept for login.html, which reads them directly.
window.JAPANOFFER_SUPABASE_URL = window.SUPABASE_URL;
window.JAPANOFFER_SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
