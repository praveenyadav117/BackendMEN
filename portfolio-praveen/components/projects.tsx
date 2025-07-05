import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Database, Code, Zap, ArrowRight, CheckCircle } from "lucide-react"

export function Projects() {
  const projects = [
    {
      id: "aquera-scim",
      title: "SCIM Connector & Microsoft 365 Optimization",
      company: "Aquera (MTS2)",
      period: "Aug 2024 – Present",
      challenge:
        "Legacy Microsoft 365 connector was experiencing severe performance issues with 30-second response times, high API costs, and inefficient request handling, impacting client satisfaction and operational costs.",
      role: "Lead Backend Engineer responsible for complete connector redesign, API optimization, and cross-functional collaboration.",
      technologies: ["Node.js", "Java", "AWS", "SCIM Protocol", "REST APIs", "Microsoft Graph API"],
      achievements: [
        { metric: "83% reduction", description: "API response time (30s → 5-6s)" },
        { metric: "40% reduction", description: "API costs through optimized requests" },
        { metric: "60% reduction", description: "Request count via payload optimization" },
        { metric: "100%", description: "Real-time data synchronization accuracy" },
      ],
      details: [
        "Redesigned query handling mechanism using efficient data structures and caching strategies",
        "Implemented payload compression and batch processing for Microsoft Graph API calls",
        "Built scalable SCIM connector supporting Google Workspace, AWS Identity, Office 365, and AS400",
        "Developed automated scripts for identity management and HR tool integrations",
        "Established real-time data synchronization pipelines for client systems",
      ],
      impact: "Improved client satisfaction scores by 45% and reduced operational costs by $50K annually",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      id: "yappes-microservices",
      title: "Microservices Architecture Redesign",
      company: "Yappes Technology (SDE2)",
      period: "Aug 2022 – Aug 2024",
      challenge:
        "Monolithic architecture was limiting scalability, causing deployment bottlenecks, and hindering team productivity. System could not handle increasing user load efficiently.",
      role: "Technical Lead managing 8-member team, responsible for architecture design, implementation strategy, and team mentorship.",
      technologies: ["Node.js", "TypeScript", "MongoDB", "MySQL", "Docker", "Jenkins", "Bitbucket", "React.js"],
      achievements: [
        { metric: "30% improvement", description: "System scalability (measured by concurrent user capacity)" },
        { metric: "50% reduction", description: "Deployment time through CI/CD automation" },
        { metric: "25% improvement", description: "Code quality scores via reviews and standards" },
        { metric: "40% faster", description: "Feature development cycles" },
      ],
      details: [
        "Migrated monolithic application to microservices using Domain-Driven Design principles",
        "Implemented service mesh architecture for inter-service communication",
        "Designed RESTful APIs with proper versioning and documentation",
        "Established CI/CD pipelines using Jenkins and Bitbucket for automated testing and deployment",
        "Led Agile development cycles with sprint planning and retrospectives",
        "Conducted comprehensive code reviews ensuring adherence to SOLID principles",
      ],
      impact: "Enabled platform to handle 3x more concurrent users and reduced time-to-market for new features by 40%",
      icon: <Database className="w-6 h-6" />,
    },
    {
      id: "tcs-automation",
      title: "Oracle PL/SQL to Python Migration & Data Pipeline Automation",
      company: "TCS (Assistant System Engineer)",
      period: "May 2021 – July 2022",
      challenge:
        "Legacy Oracle PL/SQL scripts were difficult to maintain, had limited automation capabilities, and data processing pipelines were taking excessive runtime, impacting business operations.",
      role: "Backend Developer responsible for script migration, automation implementation, and collaboration with NielsenIQ team.",
      technologies: ["Python", "SQL", "Oracle PL/SQL", "Jenkins", "Git", "Bitbucket", "VS Code"],
      achievements: [
        { metric: "20% reduction", description: "Data processing runtime (8hrs → 6.4hrs average)" },
        { metric: "70% improvement", description: "Script maintainability through Python refactoring" },
        { metric: "90% automation", description: "Manual data processing tasks eliminated" },
        { metric: "35% reduction", description: "Error rates in data processing" },
      ],
      details: [
        "Refactored complex Oracle PL/SQL procedures into modular Python scripts",
        "Implemented automated data validation and error handling mechanisms",
        "Built data processing pipelines using Python pandas and NumPy for efficient data manipulation",
        "Collaborated with NielsenIQ team to understand business requirements and optimize workflows",
        "Established version control and CI/CD practices using Git, Bitbucket, and Jenkins",
        "Created comprehensive documentation and unit tests for all migrated scripts",
      ],
      impact: "Reduced operational costs by $30K annually and improved data processing reliability by 35%",
      icon: <Code className="w-6 h-6" />,
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Featured Projects</h2>
        <p className="text-xl text-slate-600 text-center mb-16 max-w-3xl mx-auto">
          Detailed case studies showcasing technical challenges, solutions, and quantifiable business impact
        </p>

        <div className="space-y-12">
          {projects.map((project, index) => (
            <Card key={project.id} className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">{project.icon}</div>
                    <div>
                      <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                      <p className="text-slate-200 text-lg">{project.company}</p>
                      <p className="text-slate-300">{project.period}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Case Study #{index + 1}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column - Challenge & Role */}
                  <div className="lg:col-span-1 space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        The Challenge
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{project.challenge}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        My Role
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{project.role}</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-3">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Achievements */}
                  <div className="lg:col-span-1">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Key Achievements
                    </h4>
                    <div className="space-y-4">
                      {project.achievements.map((achievement, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-slate-900 mb-1">{achievement.metric}</div>
                          <div className="text-sm text-slate-600">{achievement.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Implementation Details */}
                  <div className="lg:col-span-1">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-500" />
                      Implementation Highlights
                    </h4>
                    <ul className="space-y-3">
                      {project.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                          <ArrowRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom - Business Impact */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Business Impact
                  </h4>
                  <p className="text-slate-700 font-medium">{project.impact}</p>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    View Technical Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
