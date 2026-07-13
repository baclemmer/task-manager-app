"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagMultiSelect } from "@/components/tasks/tag-multi-select";
import { createTask, updateTask } from "@/lib/actions/tasks";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  type Project,
  type Category,
  type Profile,
  type Tag,
  type TaskWithRelations,
} from "@/types/database";

interface TaskFormDialogProps {
  projects: Project[];
  categories: Category[];
  profiles: Profile[];
  tags: Tag[];
  task?: TaskWithRelations;
  trigger: React.ReactNode;
}

export function TaskFormDialog({ projects, categories, profiles, tags, task, trigger }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const action = task ? updateTask.bind(null, task.id) : createTask;

  async function handleSubmit(formData: FormData) {
    await action(formData);
    setOpen(false);
    formRef.current?.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={task?.title} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={task?.description ?? ""} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={task?.status ?? "todo"}>
                <SelectTrigger id="status">
                  <SelectValue>{(v: string) => STATUS_LABELS[v as keyof typeof STATUS_LABELS]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={task?.priority ?? undefined}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="None">
                    {(v: string | null) => (v ? PRIORITY_LABELS[v as keyof typeof PRIORITY_LABELS] : "None")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={task?.start_date ?? ""} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={task?.due_date ?? ""} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="completedDate">Complete date</Label>
              <Input
                id="completedDate"
                name="completedDate"
                type="date"
                defaultValue={task?.completed_date ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select name="assigneeId" defaultValue={task?.assignee_id ?? undefined}>
                <SelectTrigger id="assigneeId">
                  <SelectValue placeholder="Unassigned">
                    {(v: string | null) => {
                      const profile = profiles.find((p) => p.id === v);
                      return profile ? (profile.full_name ?? profile.email) : "Unassigned";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name ?? p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="projectId">Project</Label>
              <Select name="projectId" defaultValue={task?.project_id ?? undefined}>
                <SelectTrigger id="projectId">
                  <SelectValue placeholder="None">
                    {(v: string | null) => projects.find((p) => p.id === v)?.name ?? "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" defaultValue={task?.category_id ?? undefined}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="None">
                    {(v: string | null) => categories.find((c) => c.id === v)?.name ?? "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end gap-2 pb-1.5">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="isUrgent" value="on" defaultChecked={task?.is_urgent} />
                Urgent
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tags</Label>
            <TagMultiSelect availableTags={tags} defaultSelected={task?.tags.map((t) => t.name) ?? []} />
          </div>

          <Button type="submit">{task ? "Save changes" : "Create task"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
