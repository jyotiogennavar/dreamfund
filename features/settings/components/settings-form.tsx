"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DownloadIcon, Trash2Icon } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { FieldError } from "@/components/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  clearAllData,
  getExportCsv,
  updateSettings,
} from "@/features/settings/actions/settings";
import { updateSettingsSchema } from "@/features/settings/schemas";
import {
  dismissAllFieldErrors,
  EMPTY_ACTION_STATE,
  parseForm,
  shouldShowFormError,
  visibleFieldError,
} from "@/lib/form";
import { CURRENCY_OPTIONS } from "@/utils/currency";

type SettingsUser = {
  name: string | null;
  email: string;
  currency: string;
  avatarUrl: string | null;
  notifyGoalAchieved: boolean;
  notifyMonthlySummary: boolean;
  notifyDepositReminder: boolean;
};

type SettingsFormProps = {
  user: SettingsUser;
};

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState(user.currency);
  const [notifyGoalAchieved, setNotifyGoalAchieved] = useState(
    user.notifyGoalAchieved,
  );
  const [notifyMonthlySummary, setNotifyMonthlySummary] = useState(
    user.notifyMonthlySummary,
  );
  const [notifyDepositReminder, setNotifyDepositReminder] = useState(
    user.notifyDepositReminder,
  );
  const [baselineUser, setBaselineUser] = useState(user);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, formAction] = useActionState(
    updateSettings,
    EMPTY_ACTION_STATE,
  );
  const [exporting, startExport] = useTransition();

  if (
    user.currency !== baselineUser.currency ||
    user.notifyGoalAchieved !== baselineUser.notifyGoalAchieved ||
    user.notifyMonthlySummary !== baselineUser.notifyMonthlySummary ||
    user.notifyDepositReminder !== baselineUser.notifyDepositReminder
  ) {
    setBaselineUser(user);
    setCurrency(user.currency);
    setNotifyGoalAchieved(user.notifyGoalAchieved);
    setNotifyMonthlySummary(user.notifyMonthlySummary);
    setNotifyDepositReminder(user.notifyDepositReminder);
  }

  const initials = (user.name || user.email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const errorFor = (field: string) =>
    visibleFieldError(fieldErrors, state.fieldErrors, field);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = parseForm(
      updateSettingsSchema,
      new FormData(event.currentTarget),
    );
    if (!parsed.success) {
      event.preventDefault();
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    setFieldErrors((current) =>
      dismissAllFieldErrors(current, state.fieldErrors),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Form
        action={formAction}
        actionState={state}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Basic account details for your Dreamfund workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name ?? "Avatar"} />
                ) : null}
                <AvatarFallback>{initials || "DU"}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-sm">
                Avatar upload comes later. Initials are used for now.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                aria-invalid={Boolean(errorFor("name"))}
                aria-describedby={errorFor("name") ? "name-error" : undefined}
              />
              <FieldError id="name-error" message={errorFor("name")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Choose how amounts are displayed across the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label>Currency</Label>
            <input type="hidden" name="currency" value={currency} />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger
                className="w-full sm:max-w-xs"
                aria-invalid={Boolean(errorFor("currency"))}
              >
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="currency-error" message={errorFor("currency")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Preference flags only — email delivery is not wired yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <input
              type="hidden"
              name="notifyGoalAchieved"
              value={notifyGoalAchieved ? "on" : "off"}
            />
            <input
              type="hidden"
              name="notifyMonthlySummary"
              value={notifyMonthlySummary ? "on" : "off"}
            />
            <input
              type="hidden"
              name="notifyDepositReminder"
              value={notifyDepositReminder ? "on" : "off"}
            />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="notifyGoalAchieved">Goal Achieved</Label>
                <p className="text-muted-foreground text-xs">
                  When a goal reaches its target.
                </p>
              </div>
              <Switch
                id="notifyGoalAchieved"
                checked={notifyGoalAchieved}
                onCheckedChange={setNotifyGoalAchieved}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="notifyMonthlySummary">Monthly Summary</Label>
                <p className="text-muted-foreground text-xs">
                  A monthly recap of savings progress.
                </p>
              </div>
              <Switch
                id="notifyMonthlySummary"
                checked={notifyMonthlySummary}
                onCheckedChange={setNotifyMonthlySummary}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="notifyDepositReminder">Deposit Reminder</Label>
                <p className="text-muted-foreground text-xs">
                  Occasional nudges to keep depositing.
                </p>
              </div>
              <Switch
                id="notifyDepositReminder"
                checked={notifyDepositReminder}
                onCheckedChange={setNotifyDepositReminder}
              />
            </div>
          </CardContent>
        </Card>

        {shouldShowFormError(
          state.status === "ERROR" ? state.message : undefined,
          fieldErrors,
          state.fieldErrors,
        ) ? (
          <p className="text-destructive text-sm" role="alert">
            {state.message}
          </p>
        ) : null}

        <SubmitButton label="Save Settings" pendingLabel="Saving…" />
      </Form>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your goals and deposits, or wipe demo data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={exporting}
            onClick={() => {
              startExport(async () => {
                const csv = await getExportCsv();
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "dreamfund-export.csv";
                link.click();
                URL.revokeObjectURL(url);
              });
            }}
          >
            <DownloadIcon data-icon="inline-start" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
          <ConfirmDialog
            title="Clear all data?"
            description="Clear all goals and deposits? This cannot be undone."
            action={clearAllData}
            confirmLabel="Clear all data"
            pendingLabel="Clearing…"
            onSuccess={() => router.refresh()}
            trigger={
              <Button type="button" variant="destructive">
                <Trash2Icon data-icon="inline-start" />
                Clear all data
              </Button>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
