import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.https://obspafaiznaqsgaxuhcf.supabase.co;
    const supabaseKey = process.env.sb_publishable_x6PguQgSSoWqmOo96dJi7Q_ajwPsIRE;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        status: "missing_supabase_config",
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.rpc("health_check");

    if (error) {
      return res.status(503).json({
        success: false,
        status: "supabase_error",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      status: "ok",
      supabase: "connected",
      timestamp: new Date().toISOString(),
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: "error",
    });
  }
}
