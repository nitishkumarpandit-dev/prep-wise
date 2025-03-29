import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();

  return !!user;
}

export async function getInterviewByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  if (interviews.empty) return null;

  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .where("userId", "!=", userId)
    .where("finalized", "==", true)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  if (interviews.empty) return null;

  return interviews.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}
