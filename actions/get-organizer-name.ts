import { clerkClient } from "@clerk/nextjs";

export const getOrganizerName = async (organizerId: string) => {
  const { firstName, lastName } = await clerkClient.users.getUser(organizerId);

  return `${firstName} ${lastName}` || "Organizername";
};
