import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://obspafaiznaqsgaxuhcf.supabase.co",
  "sb_publishable_x6PguQgSSoWqmOo96dJi7Q_ajwPsIRE"
);

export default async function handler(req: any, res: any) {
  try {
    const { data, error } = await supabase.rpc("health_check");

    if (error) {
      return res.status(503).json({
        success: false,
        status: "supabase_error",
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      status: "ok",
      supabase: "connected",
      timestamp: new Date().toISOString(),
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: "error"
    });
  }
}
