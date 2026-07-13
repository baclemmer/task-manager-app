import { getProjects, getCategories } from "@/lib/data/projects";
import { getTags } from "@/lib/data/tags";
import { createProject, deleteProject, createCategory, deleteCategory } from "@/lib/actions/projects";
import { createTag, renameTag, deleteTag } from "@/lib/actions/tags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default async function ProjectsPage() {
  const [projects, categories, tags] = await Promise.all([
    getProjects(),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Projects, Categories & Tags</h1>
        <p className="text-sm text-muted-foreground">Manage the lists tasks are organized under.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={createProject} className="flex gap-2">
              <Input name="name" placeholder="Project name" required />
              <Input name="description" placeholder="Description (optional)" />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-col gap-2">
              {projects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects yet.</p>
              )}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    {project.description && (
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    )}
                  </div>
                  <form action={deleteProject.bind(null, project.id)}>
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={createCategory} className="flex gap-2">
              <Input name="name" placeholder="Category name" required />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-col gap-2">
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              )}
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <p className="font-medium">{category.name}</p>
                  <form action={deleteCategory.bind(null, category.id)}>
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form action={createTag} className="flex gap-2">
              <Input name="name" placeholder="Tag name" required />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-col gap-2">
              {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <form action={renameTag.bind(null, tag.id)} className="flex flex-1 gap-2">
                    <Input name="name" defaultValue={tag.name} className="h-8" />
                    <Button type="submit" variant="outline" size="sm">
                      Save
                    </Button>
                  </form>
                  <form action={deleteTag.bind(null, tag.id)}>
                    <Button type="submit" variant="ghost" size="icon">
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
