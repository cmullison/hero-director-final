export interface Env {
  DB: D1Database; // D1 binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { title, language, code } = (await request.json()) as {
      title: string;
      language: string;
      code: string;
    };

    if (!title || !code) {
      return new Response("Missing required fields", { status: 400 });
    }

    const stmt = env.DB.prepare(
      `INSERT INTO code_blocks (title, language, code) VALUES (?, ?, ?)`
    ).bind(title, language || null, code);

    try {
      const result = await stmt.run();
      return new Response(
        JSON.stringify({ success: true, id: result.meta?.last_row_id }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
