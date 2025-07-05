import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Database, Cloud, Settings, Layers, GitBranch } from "lucide-react"

export function Skills() {
  const skillCategories = [
    {
      title: "Programming Languages",
      icon: <Code className="w-6 h-6" />,
      skills: [
        { name: "JavaScript", level: "Expert" },
        { name: "TypeScript", level: "Advanced" },
        { name: "Java", level: "Advanced" },
        { name: "Python", level: "Advanced" },
        { name: "SQL", level: "Advanced" },
      ],
    },
    {
      title: "Backend Technologies",
      icon: <Database className="w-6 h-6" />,
      skills: [
        { name: "Node.js", level: "Expert" },
        { name: "Express.js", level: "Expert" },
        { name: "REST APIs", level: "Expert" },
        { name: "Microservices", level: "Advanced" },
        { name: "SCIM Protocol", level: "Advanced" },
      ],
    },
    {
      title: "Databases",
      icon: <Layers className="w-6 h-6" />,
      skills: [
        { name: "MongoDB", level: "Advanced" },
        { name: "MySQL", level: "Advanced" },
        { name: "Redis", level: "Intermediate" },
        { name: "Oracle PL/SQL", level: "Advanced" },
      ],
    },
    {
      title: "Cloud & DevOps",
      icon: <Cloud className="w-6 h-6" />,
      skills: [
        { name: "AWS", level: "Advanced" },
        { name: "Docker", level: "Advanced" },
        { name: "Jenkins", level: "Advanced" },
        { name: "CI/CD Pipelines", level: "Advanced" },
        { name: "Nginx", level: "Intermediate" },
      ],
    },
    {
      title: "Tools & Platforms",
      icon: <Settings className="w-6 h-6" />,
      skills: [
        { name: "Git", level: "Expert" },
        { name: "Bitbucket", level: "Advanced" },
        { name: "Jira", level: "Advanced" },
        { name: "VS Code", level: "Expert" },
        { name: "Postman", level: "Advanced" },
      ],
    },
    {
      title: "Methodologies",
      icon: <GitBranch className="w-6 h-6" />,
      skills: [
        { name: "Agile/Scrum", level: "Advanced" },
        { name: "System Design", level: "Advanced" },
        { name: "Design Patterns", level: "Advanced" },
        { name: "Performance Optimization", level: "Expert" },
        { name: "Code Review", level: "Advanced" },
      ],
    },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-100 text-green-800 border-green-200"
      case "Advanced":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Technical Expertise</h2>
        <p className="text-xl text-slate-600 text-center mb-16 max-w-3xl mx-auto">
          Comprehensive skill set spanning backend development, cloud technologies, and DevOps practices
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category) => (
            <Card key={category.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-slate-900">
                  <div className="p-2 bg-slate-100 rounded-lg">{category.icon}</div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-slate-700 font-medium">{skill.name}</span>
                      <Badge variant="outline" className={`text-xs ${getLevelColor(skill.level)}`}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Achievements Summary */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Career Highlights & Quantifiable Impact
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">83%</div>
              <div className="text-sm text-slate-700">API Response Time Reduction</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">30%</div>
              <div className="text-sm text-slate-700">Scalability Improvement</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">20%</div>
              <div className="text-sm text-slate-700">Runtime Reduction</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">8+</div>
              <div className="text-sm text-slate-700">Team Members Led</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
