import Link from "next/link";
import { getTasks, getProfiles } from "@/lib/data/tasks";
import { getProjects, getCategories } from "@/lib/data/projects";
import { getTags } from "@/lib/data/tags";
import { needsAttention } from "@/lib/flags";
import { FlagBadges, PriorityBadge, StatusBadge } from "@/components/tasks/flag-badge";
import { TaskQuickActions } from "@/components/tasks/task-quick-actions";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default async function AttentionPage() {
  const [tasks, profiles, projects, categories, tags] = await Promise.all([
    getTasks(),
    getProfiles(),
    getProjects(),
    getCategories(),
    getTags(),
  ]);

  const flagged = tasks
    .filter(needsAttention)
    .sort((a, b) => {
      if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Attention Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Tasks flagged &quot;Urgent&quot;, &quot;Needs Help&quot;, or &quot;Behind Schedule&quot;, sorted by
          urgency.
        </p>
      </div>

      {flagged.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nothing needs attention right now.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {flagged.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href="/dashboard" className="font-medium hover:underline">
                      {task.title}
                    </Link>
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <FlagBadges task={task} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {task.due_date && <span>Due {task.due_date}</span>}
                    {task.project && <span>{task.project.name}</span>}
                    {task.assignee && <span>{task.assignee.full_name ?? task.assignee.email}</span>}
                  </div>
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <TaskFormDialog
                    projects={projects}
                    categories={categories}
                    profiles={profiles}
                    tags={tags}
                    task={task}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <TaskQuickActions task={task} profiles={profiles} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
