import { getMe } from "@/lib/api/users";
import { GetUserQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetMe = (getUserQueryDto: GetUserQueryDto) =>
  useQuery({
    queryKey: ["users/me"],
    queryFn: () => getMe(getUserQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
