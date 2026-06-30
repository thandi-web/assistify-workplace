import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_CHAT_MODEL } from "./ai-gateway.server";

const ToolEnum = z.enum(["email", "meeting", "planner", "research"]);

const GenerateInput = z.object({
  tool: ToolEnum,
  fields: z.record(z.string(), z.string()),
});

function buildPrompt(tool: z.infer<typeof ToolEnum>, fields: Record<string, string>) {
  switch (tool) {
    case "email":
      return {
        system:
          "You are a professional email writer. Produce a clear, concise, polite business email in markdown. Include subject line as **Subject:** then body.",
        user: `Write an email with these inputs:
Recipient: ${fields.recipient || "Unspecified"}
Tone: ${fields.tone || "Professional"}
Purpose / Key points: ${fields.purpose || ""}
Additional context: ${fields.context || "None"}`,
      };
    case "meeting":
      return {
        system:
          "You summarize meeting notes for busy professionals. Output markdown with sections: ## Summary, ## Key Decisions, ## Action Items (with owner if mentioned), ## Open Questions.",
        user: `Summarize the following meeting notes/transcript:\n\n${fields.notes || ""}`,
      };
    case "planner":
      return {
        system:
          "You are an AI task planner. Break the user's goal into a prioritized, time-bounded plan. Output markdown: ## Goal, ## Milestones, ## Task List (table with Task | Priority | Estimate | Owner), ## Suggested Schedule.",
        user: `Goal: ${fields.goal || ""}
Deadline: ${fields.deadline || "Not specified"}
Constraints / context: ${fields.constraints || "None"}`,
      };
    case "research":
      return {
        system:
          "You are an AI research assistant. Provide a well-structured briefing in markdown: ## Overview, ## Key Findings (bulleted), ## Considerations / Trade-offs, ## Suggested Next Steps. Be factual and indicate uncertainty where appropriate.",
        user: `Research topic: ${fields.topic || ""}
Audience: ${fields.audience || "General professional"}
Depth: ${fields.depth || "Concise overview"}
Specific questions: ${fields.questions || "None"}`,
      };
  }
}

export const generateToolOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { system, user } = buildPrompt(data.tool, data.fields);
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(DEFAULT_CHAT_MODEL),
      system,
      prompt: user,
    });
    return { content: text };
  });

const SaveInput = z.object({
  tool: ToolEnum,
  title: z.string().min(1).max(200),
  prompt: z.record(z.string(), z.string()),
  content: z.string().min(1),
  id: z.string().uuid().optional(),
});

export const saveOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveInput.parse(input))
  .handler(async ({ data, context }) => {
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("saved_outputs")
        .update({ title: data.title, content: data.content, prompt: data.prompt })
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await context.supabase
      .from("saved_outputs")
      .insert({
        user_id: context.userId,
        tool: data.tool,
        title: data.title,
        prompt: data.prompt,
        content: data.content,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listOutputs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tool: ToolEnum }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("saved_outputs")
      .select("id,title,content,prompt,created_at,updated_at")
      .eq("user_id", context.userId)
      .eq("tool", data.tool)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const deleteOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("saved_outputs")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });