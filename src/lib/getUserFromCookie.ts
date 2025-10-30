// src/lib/getUserFromCookie.ts

export async function getUserFromCookie() {
  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch (err) {
    console.error("getUserFromCookie() error:", err);
    return null;
  }
}
