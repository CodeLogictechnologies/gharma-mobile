// export const useRefundPolicy = () => {
//   const token = useAuthStore((s) => s.token);

//   return useQuery({
//     queryKey: ["GetUserDetails"],
//     enabled: !!token,
//     queryFn: () =>
//       request<UserProfileResponse>({
//         url: `/user/detail`,
//         method: "GET",
//       }),
//   });
// };
