import { getBookMarks } from "@/lib/api/bookmarks";
import { GetBookMarksQueryDto } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetBookMarks = (
  userId: string,
  getBookMarksQueryDto: GetBookMarksQueryDto,
) => {
  return useQuery({
    queryKey: [`${userId}/bookmarks`],
    queryFn: () => getBookMarks(getBookMarksQueryDto),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
};
