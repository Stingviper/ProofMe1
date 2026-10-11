import { supabase } from "./supabase";

export async function getSkillResults(userId) {
  if (!userId) return {};
  const { data, error } = await supabase
    .from("skill_results")
    .select("skill_id, score, correct, total, updated_at")
    .eq("user_id", userId);
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    map[row.skill_id] = {
      score: row.score,
      correct: row.correct,
      total: row.total,
      updated_at: row.updated_at,
    };
  }
  return map;
}

export async function saveSkillResult({ userId, skillId, score, correct, total }) {
  if (!userId) throw new Error("You must be signed in to save results.");
  const payload = {
    user_id: userId,
    skill_id: skillId,
    score: Math.max(0, Math.min(100, Math.round(Number(score) || 0))),
    correct: Math.max(0, Number(correct) || 0),
    total: Math.max(0, Number(total) || 0),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("skill_results")
    .upsert(payload, { onConflict: "user_id,skill_id" });
  if (error) throw error;
  return payload;
}

export async function saveSubmission({
  userId,
  problemSlug,
  status,
  passedCount,
  totalCount,
  code,
  runtime,
  memory,
  solveTimeMs,
}) {
  if (!userId) throw new Error("You must be signed in to save submissions.");
  const payload = {
    user_id: userId,
    problem_slug: problemSlug,
    status,
    passed_count: passedCount,
    total_count: totalCount,
    code,
    runtime: runtime != null ? String(runtime) : null,
    memory: memory != null ? String(memory) : null,
    solve_time_ms:
      solveTimeMs != null ? Math.max(0, Math.round(Number(solveTimeMs))) : null,
  };
  const { error } = await supabase.from("submissions").insert(payload);
  if (error) throw error;
}

export async function getAcceptedSlugs(userId) {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from("submissions")
    .select("problem_slug")
    .eq("user_id", userId)
    .eq("status", "Accepted");
  if (error) throw error;
  return new Set((data || []).map((r) => r.problem_slug));
}

export async function getRecentSubmissions(userId, limit = 8) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, problem_slug, status, passed_count, total_count, runtime, solve_time_ms, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getSubmissionHistory(userId, limit = 100) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id, problem_slug, status, passed_count, total_count, runtime, memory, solve_time_ms, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getLeaderboard(limit = 25) {
  const { data: scores, error } = await supabase
    .from("skill_results")
    .select("score, correct, total, updated_at, user_id")
    .eq("skill_id", "dsa")
    .order("score", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const ids = [...new Set((scores || []).map((s) => s.user_id))];
  let profileMap = {};
  if (ids.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, username")
      .in("id", ids);
    for (const p of profiles || []) profileMap[p.id] = p;
  }

  // Best-effort accepted counts
  let solvedMap = {};
  if (ids.length) {
    const { data: subs } = await supabase
      .from("submissions")
      .select("user_id, problem_slug")
      .in("user_id", ids)
      .eq("status", "Accepted");
    for (const s of subs || []) {
      if (!solvedMap[s.user_id]) solvedMap[s.user_id] = new Set();
      solvedMap[s.user_id].add(s.problem_slug);
    }
  }

  return (scores || []).map((s, i) => ({
    rank: i + 1,
    score: s.score,
    correct: s.correct,
    total: s.total,
    updated_at: s.updated_at,
    name: profileMap[s.user_id]?.name || "Coder",
    username: profileMap[s.user_id]?.username || "unknown",
    solvedCount: solvedMap[s.user_id]?.size || 0,
  }));
}

export async function getPublicProfile(username) {
  if (!username) throw new Error("Username is required.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, username, created_at")
    .eq("username", username)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) throw new Error("Profile not found.");

  const { data: skillRows, error: skillError } = await supabase
    .from("skill_results")
    .select("skill_id, score, correct, total, updated_at")
    .eq("user_id", profile.id);
  if (skillError) throw skillError;

  const results = {};
  for (const row of skillRows || []) {
    results[row.skill_id] = {
      score: row.score,
      correct: row.correct,
      total: row.total,
      updated_at: row.updated_at,
    };
  }

  // Public accepted count via RPC if available, else try select (may be RLS-limited)
  let solvedCount = 0;
  try {
    const { data: countData, error: rpcErr } = await supabase.rpc(
      "public_accepted_count",
      { p_user_id: profile.id }
    );
    if (!rpcErr && countData != null) {
      solvedCount = Number(countData) || 0;
    } else {
      const { data: subs } = await supabase
        .from("submissions")
        .select("problem_slug")
        .eq("user_id", profile.id)
        .eq("status", "Accepted");
      solvedCount = new Set((subs || []).map((s) => s.problem_slug)).size;
    }
  } catch {
    solvedCount = 0;
  }

  return { profile, results, solvedCount };
}
