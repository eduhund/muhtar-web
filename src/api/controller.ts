const { BASE_URI = "https://time.sobakapav.ru" } = process.env;

export async function endpoint(path: string) {
  try {
    const responce = await fetch(`${BASE_URI}/${path}`, {
      method: "GET",
    });
    return responce;
  } catch {
    return false;
  }
}
