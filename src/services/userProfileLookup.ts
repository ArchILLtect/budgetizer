import { getCurrentUser } from "aws-amplify/auth";

import { toUserProfileUI } from "../api/mappers";
import { budgeteerApi } from "../api/budgeteerApi";
import type { UserProfileUI } from "../types";

export async function fetchUserProfileUIById(profileId: string): Promise<UserProfileUI | null> {
  if (!profileId) return null;
  const raw = await budgeteerApi.getUserProfile(profileId);
  if (!raw) return null;
  //The following return is preferable, but the type assertion is necessary until
  // we have better type safety/enforcement on the API response
  //return toUserProfileUI(raw as Parameters<typeof toUserProfileUI>[0]);
  return toUserProfileUI(raw);
}

export async function fetchMyUserProfileUI(): Promise<UserProfileUI | null> {
  const current = await getCurrentUser();
  const profileId = current.userId;
  return fetchUserProfileUIById(profileId);
}
