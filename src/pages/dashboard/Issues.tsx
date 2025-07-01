import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronDown,
  Github,
  MoreHorizontal,
  Filter,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { VscIssues } from "react-icons/vsc";

interface User {
  name: string;
  avatar: string;
}

interface Feedback {
  user: User;
  time: string;
  comment: string;
  likes: number;
  dislikes: number;
}

const mockFeedback: Feedback[] = [
  {
    user: { name: "GraceLee", avatar: "/api/placeholder/40/40" },
    time: "4 hours ago",
    comment:
      "Excited about the migration! Hoping for a smoother experience with Webflow.",
    likes: 12,
    dislikes: 2,
  },
  {
    user: { name: "LouisWong", avatar: "/api/placeholder/40/40" },
    time: "12 hours ago",
    comment:
      "Will this affect any of the features we currently enjoy on the landing page?",
    likes: 45,
    dislikes: 8,
  },
  {
    user: { name: "JaniceKan", avatar: "/api/placeholder/40/40" },
    time: "20 hours ago",
    comment:
      "Looking forward to any improvements this migration might bring! Would love to see faster load times or improved responsiveness.",
    likes: 12,
    dislikes: 1,
  },
  {
    user: { name: "LeeHuang", avatar: "/api/placeholder/40/40" },
    time: "1 days ago",
    comment:
      "Thanks for informing us! Will there be any downtime during the transition?",
    likes: 72,
    dislikes: 13,
  },
  {
    user: { name: "CoolKids", avatar: "/api/placeholder/40/40" },
    time: "2 days ago",
    comment:
      "Excited to see how the landing page evolves with this migration! Looking forward to a more polished and optimized experience.",
    likes: 0,
    dislikes: 0,
  },
];

const IssuesPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-background to-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-background dark:to-gray-900  p-6 font-sans h-full overflow-y-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="border">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-lg">
            <VscIssues className="h-6 w-6 " />
            <span className="">New Web Themes</span>
            <span className="text-muted">/</span>
            <Badge variant="secondary" className="text-base bg-gray-200 ">
              72
            </Badge>
            <span className="font-semibold">Active</span>
            <span className="text-muted">2/12</span>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5 rotate-180" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="">Assigned to</span>
          <div className="flex items-center -space-x-2">
            <Avatar className="bg-accent border-2 h-9 w-9 ">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="bg-accent border-2 h-9 w-9 ">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="bg-accent border-2 h-9 w-9 ">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>
          <Button variant="outline" className="border ">
            Change status
            <ChevronDown className="h-5 w-5 ml-2 " />
          </Button>
          <Button variant="ghost" size="icon" className="border">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2 ">
              <Github className="h-5 w-5" />
              <span>Repository in</span>
            </Button>
            <Button variant="outline" className="">
              View issue on{" "}
              <span className="ml-2 font-bold text-indigo-600">🌀</span>
            </Button>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Migrate Landing Page Hosting To Webflow
          </h1>

          <div className="text-base">
            <h2 className="font-semibold  mb-1">Task Objective:</h2>
            <p className="">
              To seamlessly transition our landing page hosting from its current
              platform to Webflow, leveraging its powerful design and hosting
              capabilities for improved performance and flexibility.
              <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                Monique
              </Badge>
            </p>
          </div>

          <div className="text-base">
            <h2 className="font-semibold  mb-1">Description:</h2>
            <p className="">
              We aim to migrate our landing page hosting to Webflow to take
              advantage of its intuitive design interface, robust hosting
              infrastructure, and seamless integration options. This migration
              involves transferring all existing landing page assets, including
              HTML, CSS, JavaScript, images, and other media files, to Webflow's
              platform.
              <Badge className="ml-2 bg-green-100 text-green-700 border-green-300">
                Louis
              </Badge>
            </p>
          </div>

          <div className="relative bg-gradient-to-br from-blue-200 via-pink-200 to-orange-200 p-4 rounded-xl">
            <div
              className="h-64 rounded-lg"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-px h-full bg-pink-400 opacity-50"></div>
              <div className="absolute h-px w-full bg-pink-400 opacity-50"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="h-full w-[1px] bg-pink-500"></div>
                <span className="text-pink-600 bg-white/50 text-sm backdrop-blur-sm px-2 py-1 rounded-md">
                  1366px
                </span>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChevronDown className="h-5 w-5" />
                Links
              </h3>
              <Button variant="ghost" className="gap-2 ">
                <Plus className="h-5 w-5" />
                <span>Add issue</span>
              </Button>
            </div>
            <div className="space-y-3">
              {/* Link Item 1 */}
              <div className="border  p-4 rounded-xl flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">
                    Display API Logs In Dashboard
                  </h4>
                  <p className="text-sm  mt-1">
                    A section in the dashboard that would display the API logs,
                    for informational/debugging purposes.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm ">
                    <span className="flex items-center gap-1.5">
                      <VscIssues className="w-4 h-4" />
                      Single users <Badge variant="outline">120</Badge>
                    </span>
                    <span>
                      Small team <Badge variant="outline">46</Badge>
                    </span>
                    <span>
                      United States <Badge variant="outline">18</Badge>
                    </span>
                    <span>
                      Plus plan <Badge variant="outline">69</Badge>
                    </span>
                    <span>5+</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="text-base ">60</Badge>
                  <Avatar className="bg-accent border-2 h-9 w-9">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {/* Link Item 2 */}
              <div className="border  p-4 rounded-xl flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">
                    Frontend API Docs (Reference)
                  </h4>
                  <p className="text-sm  mt-1">
                    Full documentation for frontend API, which is used by all
                    SDKs to interact directly.
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm ">
                    <span className="flex items-center gap-1.5">
                      <VscIssues className="w-4 h-4" />
                      Single users <Badge variant="outline">180</Badge>
                    </span>
                    <span>
                      Mid-size <Badge variant="outline">24</Badge>
                    </span>
                    <span>
                      Engineer <Badge variant="outline">18</Badge>
                    </span>
                    <span>
                      Plus plan <Badge variant="outline">44</Badge>
                    </span>
                    <span>6+</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="text-base ">57</Badge>
                  <div className="flex items-center -space-x-2">
                    <Avatar className="bg-accent border-2 h-9 w-9">
                      <AvatarImage src="/api/placeholder/32/32" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Avatar className="bg-accent border-2 h-9 w-9">
                      <AvatarImage src="/api/placeholder/32/32" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Avatar className="bg-accent border-2 h-9 w-9">
                      <AvatarImage src="/api/placeholder/32/32" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChevronDown className="h-5 w-5" />
                Comments
              </h3>
              <Button variant="ghost" className="gap-2 ">
                <Plus className="h-5 w-5" />
                <span>Add comment</span>
              </Button>
            </div>
            <div className="flex gap-4">
              <Avatar className="bg-accent border-2 h-10 w-10">
                <AvatarImage src="/api/placeholder/40/40" />
                <AvatarFallback>LN</AvatarFallback>
              </Avatar>
              <div className="border  rounded-xl p-4 flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">@LouisNguyen</span>
                  <span className="text-sm ">1 days ago</span>
                </div>
                <p className="mt-2">
                  This is where the comment content would go.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <aside className="col-span-4 space-y-6">
          <div className="border  rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold ">User insights:</h3>
              <Button variant="ghost" size="sm" className="">
                Sort
              </Button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Single users",
                  value: 85,
                  count: 206,
                  color: "bg-purple-500",
                },
                {
                  label: "Mid-size team",
                  value: 65,
                  count: 80,
                  color: "bg-green-500",
                },
                {
                  label: "Small team",
                  value: 50,
                  count: 60,
                  color: "bg-teal-500",
                },
                {
                  label: "Germany",
                  value: 40,
                  count: 47,
                  color: "bg-blue-500",
                },
                {
                  label: "Free plan",
                  value: 95,
                  count: 160,
                  color: "bg-orange-500",
                },
                {
                  label: "Plus plan",
                  value: 25,
                  count: 25,
                  color: "bg-yellow-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 ">
                    <VscIssues className="h-4 w-4" /> {item.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={item.value}
                      className="w-28 h-2"
                      indicatorClassName={item.color}
                    />
                    <span className="w-8 text-right ">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border  rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold ">User feedbacks:</h3>
              <Button variant="ghost" size="sm" className="gap-2 ">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
            <div className="space-y-5">
              {mockFeedback.map((feedback, index) => (
                <div key={index} className="flex gap-3">
                  <Avatar className="bg-accent border-2 h-10 w-10">
                    <AvatarImage src={feedback.user.avatar} />
                    <AvatarFallback>
                      {feedback.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        @{feedback.user.name}
                      </span>
                      <span className="text-xs ">{feedback.time}</span>
                    </div>
                    <p className="mt-1 text-sm ">{feedback.comment}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs ">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 px-2 py-1 h-auto"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{feedback.likes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 px-2 py-1 h-auto"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{feedback.dislikes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 h-auto"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default IssuesPage;
