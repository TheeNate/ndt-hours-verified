// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { supabase as mockSupabase } from "./supabaseMock";

// Load your env-vars
const supabaseUrl   = import.meta.env.VITE_SUPABASE_URL   || "your-project-url";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

// Toggle mock vs. real
const useMock = import.meta.env.VITE_USE_MOCK_SUPABASE === "true";

// Debug output
console.log("🔌 Supabase mode:", useMock ? "MOCK" : "REAL");
console.log("🔌 Supabase URL:", supabaseUrl);

// Export the appropriate client
export const supabase = useMock
  ? mockSupabase
  : createClient<Database>(supabaseUrl, supabaseAnonKey);
