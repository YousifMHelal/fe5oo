import { session } from "@/lib/auth";
import { ProfileClient } from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const s = await session();
  const user = {
    id: s.user.id,
    username: s.user.username,
    fullName: s.user.fullName,
    role: s.user.role as string,
  };
  return <ProfileClient user={user} />;
}
