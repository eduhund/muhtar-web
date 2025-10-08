export default async function getAll() {
  return fetch("https://time.sobakapav.ru/api/all")
    .then((response) => {
      return response.json();
    })
    .then((data: any) => {
      return data;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    })
    .finally(() => {
      console.log("Fetch operation completed.");
    });
}
