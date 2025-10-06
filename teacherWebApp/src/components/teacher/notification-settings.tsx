"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [mute, setMute] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Email Alerts</Label>
          <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
        </div>
        <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Mute Notifications</Label>
          <p className="text-sm text-muted-foreground">Temporarily mute all notifications.</p>
        </div>
        <Switch checked={mute} onCheckedChange={setMute} />
      </div>
    </div>
  );
}
