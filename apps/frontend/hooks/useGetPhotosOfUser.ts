import { getPhotosOfUser } from "@/lib/api/users";
import { GetPhotosOfUserQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetPhotosOfUser = (
  userId: string,
  getPhotosOfUserQueryDto: GetPhotosOfUserQueryDto,
) => {
  return useQuery({
    queryKey: [`photos-of-user-${userId}`],
    queryFn: () => getPhotosOfUser(getPhotosOfUserQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId && !!getPhotosOfUserQueryDto,
  });
};
