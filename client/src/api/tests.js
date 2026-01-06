const API_URL = `${import.meta.env.VITE_API_URL}/api/tests`;

export async function getAllTests() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Помилка при отриманні тестів");
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
