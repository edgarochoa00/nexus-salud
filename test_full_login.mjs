import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "godoy@ejemplo.com", // Assuming godoy for testing
    password: "password123", // Guessing or maybe it just returns wrong password
  });

  if (error) {
    console.error("Login error:", error);
  } else {
    console.log("Login success:", data.user?.email);
  }
}

testLogin();
