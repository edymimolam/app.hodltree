import useSWR from "swr";

const defaultReq = {
  contract: "0x9641a76818c1e0ada2d76b11fbd0e8ace0ecc165",
  method: "info",
};

export function useServerAPI(endpoint = "stablecoins", req = defaultReq) {
  const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}${endpoint}`;

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(req),
    });

    if (res.ok) return res.json();

    const error = new Error("An error occurred while fetching the data.");
    error.message = await res.text();
    throw error;
  };

  const { data, error } = useSWR(endpoint ? apiUrl : null, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  error && console.log(error);

  return {
    data,
    error,
    isLoading: !error && !data,
  };
}
