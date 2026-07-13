import { Badge } from "@/components/ui/badge";
import type { TaskWithFlags } from "@/types/database";
import { cn } from "@/lib/utils";

export function FlagBadges({ task, className }: { task: TaskWithFlags; className?: string }) {
  if (!task.is_urgent && !task.needs_help && !task.is_behind_schedule) return null;

  return (
    <div className={cn("flex gap-1.5", className)}>
      {task.is_urgent && (
        <Badge className="bg-rose-700 text-white hover:bg-rose-700">Urgent</Badge>
      )}
      {task.needs_help && (
        <Badge className="bg-red-600 text-white hover:bg-red-600">Needs Help</Badge>
      )}
      {task.is_behind_schedule && (
        <Badge className="bg-orange-500 text-white hover:bg-orange-500">Behind Schedule</Badge>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: TaskWithFlags["status"] }) {
  const variants: Record<string, string> = {
    todo: "bg-slate-200 text-slate-800 hover:bg-slate-200",
    in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    waiting: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    done: "bg-green-100 text-green-800 hover:bg-green-100",
  };
  const labels: Record<string, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    waiting: "Waiting",
    done: "Done",
  };
  return <Badge className={variants[status]}>{labels[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TaskWithFlags["priority"] }) {
  if (!priority) return null;
  const variants: Record<string, string> = {
    low: "bg-slate-100 text-slate-600 hover:bg-slate-100",
    medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    high: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  return <Badge variant="outline" className={variants[priority]}>{priority}</Badge>;
}
