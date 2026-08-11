/**
 * Client-side AI Processing Utility for Multi-Agent Kanban Board.
 * Connects to the centralized server-side API endpoint for unified processing.
 */

interface AgentResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export async function processCardWithAgent(
  cardTitle: string,
  currentDescription: string,
  agentType: string,
  customPrompt: string = ""
): Promise<AgentResponse> {
  try {
    const response = await fetch("/API/ai-process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardTitle,
        currentDescription,
        agentType,
        customPrompt,
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return { success: true, content: data.content };
    } else {
      return { success: false, error: data.error || "Gagal memproses kartu dengan AI." };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghubungi server AI." };
  }
}
