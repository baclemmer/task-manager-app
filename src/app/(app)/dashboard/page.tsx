import { getTasks, getProfiles } from "@/lib/data/tasks";
import { getProjects, getCategories } from "@/lib/data/projects";
import { getTags } from "@/lib/data/tags";
import { DashboardView } from "@/components/tasks/dashboard-view";

export default async function DashboardPage() {
  const [tasks, projects, categories, profiles, tags] = await Promise.all([
    getTasks(),
    getProjects(),
    getCategories(),
    getProfiles(),
    getTags(),
  ]);

  return (
    <DashboardView
      tasks={tasks}
      projects={projects}
      categories={categories}
      profiles={profiles}
      tags={tags}
    />
  );
}
