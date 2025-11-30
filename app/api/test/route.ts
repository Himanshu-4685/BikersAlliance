// app/api/test/route.ts
export async function GET(request: Request) {
  const data = { ok: true, message: 'test route' };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}