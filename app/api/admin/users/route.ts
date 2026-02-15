import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbQuery, supabase } from "@/lib/db";
import { adminCreateUserSchema } from "@/lib/validations";
import { Role, User } from "@/types/domain";

function roleFromUserType(userType: "MEMBER" | "MANAGER" | "SUPER_ADMIN"): Role {
  if (userType === "MEMBER") {
    return "AGENT";
  }
  if (userType === "MANAGER") {
    return "MANAGER";
  }
  return "ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const managers = await dbQuery<Array<Pick<User, "id" | "name" | "email">>>(() =>
    supabase.from("users").select("id, name, email").eq("role", "MANAGER").is("deleted_at", null).order("name", { ascending: true }),
  );
  const superAdmins = await dbQuery<Array<Pick<User, "id" | "name" | "email">>>(() =>
    supabase.from("users").select("id, name, email").eq("role", "ADMIN").is("deleted_at", null).order("name", { ascending: true }),
  );

  return NextResponse.json({
    managers: managers.error ? [] : managers.data,
    superAdmins: superAdmins.error ? [] : superAdmins.data,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = adminCreateUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const email = payload.email.trim().toLowerCase();
  const role = roleFromUserType(payload.userType);

  if (payload.userType === "MEMBER" && !payload.reportsToUserId) {
    return NextResponse.json({ error: "Member must report to a manager" }, { status: 400 });
  }
  if (payload.userType === "MANAGER" && !payload.reportsToUserId) {
    return NextResponse.json({ error: "Manager must report to a super admin" }, { status: 400 });
  }
  if (payload.userType === "SUPER_ADMIN" && payload.reportsToUserId) {
    return NextResponse.json({ error: "Super admin cannot have a reporting manager" }, { status: 400 });
  }

  let reportsTo: User | null = null;
  if (payload.reportsToUserId) {
    const reporter = await dbQuery<User>(() =>
      supabase.from("users").select("*").eq("id", payload.reportsToUserId).single(),
    );
    if (reporter.error) {
      return NextResponse.json({ error: "Reporting user not found" }, { status: 400 });
    }
    reportsTo = reporter.data;

    if (payload.userType === "MEMBER" && reportsTo.role !== "MANAGER") {
      return NextResponse.json({ error: "Member must report to a manager" }, { status: 400 });
    }
    if (payload.userType === "MANAGER" && reportsTo.role !== "ADMIN") {
      return NextResponse.json({ error: "Manager must report to a super admin" }, { status: 400 });
    }
  }

  const createResult = await dbQuery<User>(() =>
    supabase
      .from("users")
      .insert({
        name: payload.name.trim(),
        email,
        role,
        reports_to: reportsTo?.id ?? null,
        area_id: reportsTo?.area_id ?? null,
      })
      .select("*")
      .single(),
  );
  if (createResult.error) {
    return NextResponse.json({ error: createResult.error.message }, { status: 400 });
  }

  // If member is created under manager, attach to manager's team(s) for assignment flow.
  if (payload.userType === "MEMBER" && reportsTo) {
    const managerTeams = await dbQuery<Array<{ team_id: string }>>(() =>
      supabase.from("team_members").select("team_id").eq("user_id", reportsTo.id),
    );

    if (!managerTeams.error) {
      for (const membership of managerTeams.data) {
        await supabase.from("team_members").upsert(
          {
            user_id: createResult.data.id,
            team_id: membership.team_id,
            hierarchy_level: 1,
          },
          { onConflict: "user_id,team_id" },
        );
      }
    }
  }

  return NextResponse.json(createResult.data, { status: 201 });
}
