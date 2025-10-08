import { useEffect, useState } from "react";

export function useTime() {
  const [data, setData] = useState([]) as any;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    /*
    getAll().then((data) => {
      const preparedData = data.map((item: any, i: number) => ({
        key: i,
        ...item,
      }));
      setData(preparedData);
      setLoading(false);
    });
    */
  }, []);

  return { data, isLoading: loading };
}
