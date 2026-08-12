import { SettingsForm } from "@/features/settings/components/settings-form";
import { getDemoUser } from "@/lib/demo-user";

export default async function SettingsPage() {
  const user = await getDemoUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your profile, preferences, and demo data.
        </p>
      </div>
      <SettingsForm
        user={{
          name: user.name,
          email: user.email,
          currency: user.currency,
          avatarUrl: user.avatarUrl,
          notifyGoalAchieved: user.notifyGoalAchieved,
          notifyMonthlySummary: user.notifyMonthlySummary,
          notifyDepositReminder: user.notifyDepositReminder,
        }}
      />
    </div>
  );
}
