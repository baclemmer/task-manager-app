"use client";

import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  setNeedsHelp,
  setBehindScheduleOverride,
  setTaskStatus,
  setUrgent,
  reassignTask,
} from "@/lib/actions/tasks";
import { STATUS_LABELS, TASK_STATUSES, type Profile, type TaskWithRelations } from "@/types/database";

export function TaskQuickActions({ task, profiles }: { task: TaskWithRelations; profiles: Profile[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => startTransition(() => setUrgent(task.id, !task.is_urgent))}>
          {task.is_urgent ? "Clear “Urgent”" : "Mark Urgent"}
        </DropdownMenuItem>
        {task.needs_help && (
          <DropdownMenuItem onClick={() => startTransition(() => setNeedsHelp(task.id, false))}>
            Clear &quot;Needs Help&quot;
          </DropdownMenuItem>
        )}
        {task.is_behind_schedule && (
          <DropdownMenuItem
            onClick={() => startTransition(() => setBehindScheduleOverride(task.id, false))}
          >
            Clear &quot;Behind Schedule&quot;
          </DropdownMenuItem>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {TASK_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === task.status}
                onClick={() => startTransition(() => setTaskStatus(task.id, status))}
              >
                {STATUS_LABELS[status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Reassign</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {profiles.map((profile) => (
              <DropdownMenuItem
                key={profile.id}
                disabled={profile.id === task.assignee_id}
                onClick={() => startTransition(() => reassignTask(task.id, profile.id))}
              >
                {profile.full_name ?? profile.email}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
