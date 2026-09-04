import { supabase } from "./supabase";

export async function getSkillResults(userId) {
  if (!supabase || !userId) return {};
  const { data, error } = await supabase.from("skill_results").select("skill_id,score").eq("user_id", userId);
  if (error) throw error;
  return data || [];
}

export async function saveSkillResult({ userId, skillId, score, correct, total }) {
  if (!supabase || !userId) throw new Error("Account is not connected.");
  const { error } = await supabase.from("skill_results").upsert({
    user_id: userId,
    skill_id: skillId,
    score,
    correct,
    total,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,skill_id" });
  if (error) throw error;
}

export async function saveSubmission({ userId, problemSlug, status, passedCount, totalCount, code, runtime, memory }) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from("submissions").insert({
    user_id: userId,
    problem_slug: problemSlug,
    status,
    passed_count: passedCount,
    total_count: totalCount,
    code,
    runtime: runtime || null,
    memory: memory || null,
  });
  if (error) throw error;
}

export async function getPublicProfile(username) {
  if (!supabase) return null;
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id,name,username,created_at").eq("username", username).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;
  const { data: results, error: resultsError } = await supabase.from("skill_results").select("skill_id,score").eq("user_id", profile.id);
  if (resultsError) throw resultsError;
  return { profile, results: Object.fromEntries((results || []).map((r) => [r.skill_id, r.score])) };
}
