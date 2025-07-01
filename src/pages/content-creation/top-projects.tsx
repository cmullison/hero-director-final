import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const projects = [
  {
    id: 1,
    name: "Customer Support Bot",
    description: "AI assistant for customer inquiries",
    usage: 85,
    status: "active",
    type: "Chat",
  },
  {
    id: 2,
    name: "Product Catalog Generator",
    description: "Automated product image creation",
    usage: 72,
    status: "active",
    type: "Image",
  },
  {
    id: 3,
    name: "Code Review Assistant",
    description: "Automated code review and suggestions",
    usage: 68,
    status: "active",
    type: "Code",
  },
  {
    id: 4,
    name: "Marketing Video Creator",
    description: "AI-generated marketing videos",
    usage: 54,
    status: "active",
    type: "Video",
  },
  {
    id: 5,
    name: "Research Summarizer",
    description: "Summarizes research papers and articles",
    usage: 47,
    status: "active",
    type: "Chat",
  },
];

export function TopProjects() {
  return (
    <div className="space-y-8">
      {projects.map((project) => (
        <div key={project.id} className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`/placeholder.svg?height=40&width=40`}
                  alt={project.name}
                />
                <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {project.name}
                  </p>
                  <Badge variant="outline">{project.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <Badge
              variant={project.status === "active" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={project.usage} className="h-2" />
            <span className="text-sm font-medium">{project.usage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
