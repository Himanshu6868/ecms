"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserType = "MEMBER" | "MANAGER" | "SUPER_ADMIN";

interface OptionUser {
  id: string;
  name: string;
  email: string;
}

export function AdminUserCreator({
  managers,
  superAdmins,
}: {
  managers: OptionUser[];
  superAdmins: OptionUser[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("MEMBER");
  const [reportsToUserId, setReportsToUserId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reporterOptions = useMemo(() => {
    if (userType === "MEMBER") {
      return managers;
    }
    if (userType === "MANAGER") {
      return superAdmins;
    }
    return [];
  }, [userType, managers, superAdmins]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      nextErrors.name = "Name is required.";
    }
    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email.";
    }
    if (userType !== "SUPER_ADMIN" && !reportsToUserId) {
      nextErrors.reportsToUserId = "Please select a reporting user.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!validate()) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    setErrors({});

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      userType,
      reportsToUserId: userType === "SUPER_ADMIN" ? null : reportsToUserId || null,
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json()) as { error?: string; id?: string };
    if (!res.ok) {
      setMessage(body.error ?? "Unable to create user.");
      setIsSaving(false);
      return;
    }

    setMessage("User created successfully.");
    setName("");
    setEmail("");
    setReportsToUserId("");
    setIsSaving(false);
  }

  return (
    <section className="surface mb-6 space-y-5 p-5 md:p-6">
      <div>
        <h2 className="[font-family:var(--font-space)] text-xl font-semibold">Create Internal User</h2>
        <p className="text-soft mt-1 text-sm">
          Super admin can create Member, Manager, or Super Admin and set reporting hierarchy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="internal-name">Name *</Label>
          <Input id="internal-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="internal-email">Email *</Label>
          <Input id="internal-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@company.com" />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>User Type</Label>
          <Select
            value={userType}
            onValueChange={(value) => {
              setUserType(value as UserType);
              setReportsToUserId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            {userType === "MEMBER" ? "Reporting Manager *" : userType === "MANAGER" ? "Reporting Super Admin *" : "Reporting"}
          </Label>
          {userType === "SUPER_ADMIN" ? (
            <Input value="Not required for Super Admin" readOnly />
          ) : (
            <Select value={reportsToUserId} onValueChange={setReportsToUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select reporting user" />
              </SelectTrigger>
              <SelectContent>
                {reporterOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.reportsToUserId ? <p className="text-sm text-rose-600">{errors.reportsToUserId}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={submit} disabled={isSaving}>
          {isSaving ? "Creating..." : "Create User"}
        </Button>
        {message ? <p className="text-soft text-sm">{message}</p> : null}
      </div>
    </section>
  );
}
