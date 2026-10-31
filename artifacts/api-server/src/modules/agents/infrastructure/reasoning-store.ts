import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import type { ReasoningLanguage, ReasoningReport } from "../domain/reasoning";
let ready: Promise<void> | undefined;
function initialize() {
  return ready ??= db.execute(sql`CREATE TABLE IF NOT EXISTS agent_reasoning_reports(
    id text PRIMARY KEY, agent_id text NOT NULL, language text NOT NULL,
    created_at timestamptz NOT NULL, record jsonb NOT NULL);
    CREATE INDEX IF NOT EXISTS agent_reasoning_reports_history ON agent_reasoning_reports(agent_id,language,created_at DESC)`)
    .then(() => undefined).catch(error => { ready = undefined; throw error; });
}
export async function saveReasoning(report: ReasoningReport) {
  await initialize();
  await db.execute(sql`INSERT INTO agent_reasoning_reports(id,agent_id,language,created_at,record)
    VALUES(${report.id},${report.agentId},${report.language},${report.createdAt},${JSON.stringify(report)}::jsonb)`);
}
export async function reasoningHistory(agentId: string, language: ReasoningLanguage): Promise<ReasoningReport[]> {
  await initialize();
  const result = await db.execute(sql`SELECT record FROM agent_reasoning_reports WHERE agent_id=${agentId}
    AND language=${language} ORDER BY created_at DESC,id DESC LIMIT 20`);
  return result.rows.map(row => row.record as ReasoningReport);
}
