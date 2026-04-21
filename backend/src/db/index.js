import { createClient } from "@supabase/supabase-js";
import { config } from "../config/index.js";

// Module-level singleton — every import of this file shares the same client.
export const supabase = createClient(config.supabase.url, config.supabase.key);
