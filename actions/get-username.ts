import { clerkClient } from "@clerk/nextjs";

export const getUsername = async (userId: string) => {
  const { firstName, lastName } = await clerkClient.users.getUser(userId);

  return `${firstName} ${lastName}` || "username";
};
