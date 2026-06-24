import { requireRoleForPage } from "@/lib/auth";
import { getSettings } from "@/actions/settings";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  await requireRoleForPage("ADMIN");
  const settings = await getSettings();
  return <SettingsClient settings={settings} />;
}
