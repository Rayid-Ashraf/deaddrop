import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aakklcsevurowwcfydnn.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFha2tsY3NldnVyb3d3Y2Z5ZG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MjYyMzcsImV4cCI6MjA1ODMwMjIzN30.IodyFm2XI8eDIOWWC410PLzbQO8jK6oqnTI-hiFNpF8";
export const supabase = createClient(supabaseUrl, supabaseKey);
