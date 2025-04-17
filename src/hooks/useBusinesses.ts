import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getAccessToken } from "@/auth";

export function useBusinesses() {
  return useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const token = await getAccessToken();
      const { data } = await axios.get("/api/businesses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}
