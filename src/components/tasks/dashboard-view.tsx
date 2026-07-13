"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { FlagBadges, PriorityBadge, StatusBadge } from "@/components/tasks/flag-badge";
import { TaskQuickActions } from "@/components/tasks/task-quick-actions";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type Category,
  type Profile,
  type Project,
  type Tag,
  type TaskWithRelations,
} from "@/types/database";

const ALL = "__all__";

type GroupBy = "none" | "project" | "assignee" | "category" | "status";
type FlagFilter = "any" | "needs_help" | "behind_schedule" | "urgent" | "none";
type ViewMode = "list" | "kanban";

const FLAG_LABELS: Record<FlagFilter, string> = {
  any: "Any flag",
  needs_help: "Needs Help",
  behind_schedule: "Behind Schedule",
  urgent: "Urgent",
  none: "No flag",
};

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  none: "No grouping",
  project: "Project",
  assignee: "Assignee",
  category: "Category",
  status: "Status",
};

interface DashboardViewProps {
  tasks: TaskWithRelations[];
  projects: Project[];
  categories: Category[];
  profiles: Profile[];
  tags: Tag[];
}

export function DashboardView({ tasks, projects, categories, profiles, tags }: DashboardViewProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [projectFilter, setProjectFilter] = useState(ALL);
  const [assigneeFilter, setAssigneeFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [flagFilter, setFlagFilter] = useState<FlagFilter>("any");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (projectFilter !== ALL && task.project_id !== projectFilter) return false;
      if (assigneeFilter !== ALL && task.assignee_id !== assigneeFilter) return false;
      if (categoryFilter !== ALL && task.category_id !== categoryFilter) return false;
      if (statusFilter !== ALL && task.status !== statusFilter) return false;
      if (flagFilter === "needs_help" && !task.needs_help) return false;
      if (flagFilter === "behind_schedule" && !task.is_behind_schedule) return false;
      if (flagFilter === "urgent" && !task.is_urgent) return false;
      if (flagFilter === "none" && (task.needs_help || task.is_behind_schedule || task.is_urgent)) return false;
      if (query) {
        const haystack = `${task.title} ${task.tags.map((t) => t.name).join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [tasks, projectFilter, assigneeFilter, categoryFilter, statusFilter, flagFilter, search]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ key: "all", label: null, tasks: filtered }];

    const map = new Map<string, { label: string; tasks: TaskWithRelations[] }>();
    for (const task of filtered) {
      let key: string;
      let label: string;
      if (groupBy === "project") {
        key = task.project_id ?? "none";
        label = task.project?.name ?? "No project";
      } else if (groupBy === "assignee") {
        key = task.assignee_id ?? "none";
        label = task.assignee?.full_name ?? task.assignee?.email ?? "Unassigned";
      } else if (groupBy === "category") {
        key = task.category_id ?? "none";
        label = task.category?.name ?? "No category";
      } else {
        key = task.status;
        label = STATUS_LABELS[task.status];
      }
      if (!map.has(key)) map.set(key, { label, tasks: [] });
      map.get(key)!.tasks.push(task);
    }
    return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
  }, [filtered, groupBy]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">All tasks, filterable and groupable.</p>
        </div>
        <div className="flex items-center gap-2">
          <TaskFormDialog
            projects={projects}
            categories={categories}
            profiles={profiles}
            tags={tags}
            trigger={<Button>New task</Button>}
          />
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search title or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <FilterSelect
          label="Project"
          allLabel="All projects"
          value={projectFilter}
          onChange={setProjectFilter}
          items={projects.map((p) => ({ value: p.id, label: p.name }))}
        />
        <FilterSelect
          label="Assignee"
          allLabel="All assignees"
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          items={profiles.map((p) => ({ value: p.id, label: p.full_name ?? p.email }))}
        />
        <FilterSelect
          label="Category"
          allLabel="All categories"
          value={categoryFilter}
          onChange={setCategoryFilter}
          items={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FilterSelect
          label="Status"
          allLabel="All statuses"
          value={statusFilter}
          onChange={setStatusFilter}
          items={TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
        <Select value={flagFilter} onValueChange={(v) => setFlagFilter((v ?? "any") as FlagFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Flag">{(v) => FLAG_LABELS[v as FlagFilter] ?? "Flag"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any flag</SelectItem>
            <SelectItem value="needs_help">Needs Help</SelectItem>
            <SelectItem value="behind_schedule">Behind Schedule</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="none">No flag</SelectItem>
          </SelectContent>
        </Select>
        {view === "list" && (
          <Select value={groupBy} onValueChange={(v) => setGroupBy((v ?? "none") as GroupBy)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Group by">
                {(v) => GROUP_BY_LABELS[v as GroupBy] ?? "Group by"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No grouping</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="assignee">Assignee</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {view === "list" ? (
        <ListView
          groups={groups}
          profiles={profiles}
          projects={projects}
          categories={categories}
          tags={tags}
        />
      ) : (
        <KanbanView
          tasks={filtered}
          profiles={profiles}
          projects={projects}
          categories={categories}
          tags={tags}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  allLabel,
  value,
  onChange,
  items,
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder={label}>
          {(v: string) => (v === ALL ? allLabel : (items.find((i) => i.value === v)?.label ?? label))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ListView({
  groups,
  profiles,
  projects,
  categories,
  tags,
}: {
  groups: { key: string; label: string | null; tasks: TaskWithRelations[] }[];
  profiles: Profile[];
  projects: Project[];
  categories: Category[];
  tags: Tag[];
}) {
  const total = groups.reduce((sum, g) => sum + g.tasks.length, 0);
  if (total === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No tasks match these filters.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-2">
          {group.label && <h2 className="text-sm font-medium text-muted-foreground">{group.label}</h2>}
          <div className="flex flex-col gap-2">
            {group.tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="flex items-start justify-between gap-4 py-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <FlagBadges task={task} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {task.due_date && <span>Due {task.due_date}</span>}
                      {task.project && <span>{task.project.name}</span>}
                      {task.category && <span>{task.category.name}</span>}
                      {task.assignee && (
                        <span>{task.assignee.full_name ?? task.assignee.email}</span>
                      )}
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
        </div>
      ))}
    </div>
  );
}

function KanbanView({
  tasks,
  profiles,
  projects,
  categories,
  tags,
}: {
  tasks: TaskWithRelations[];
  profiles: Profile[];
  projects: Project[];
  categories: Category[];
  tags: Tag[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {STATUS_LABELS[status]} ({columnTasks.length})
            </h2>
            <div className="flex flex-col gap-2">
              {columnTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex flex-col gap-2 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{task.title}</span>
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
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      <FlagBadges task={task} />
                      {task.tags.map((tag) => (
                        <Badge key={tag.id} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    {task.due_date && (
                      <span className="text-xs text-muted-foreground">Due {task.due_date}</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
