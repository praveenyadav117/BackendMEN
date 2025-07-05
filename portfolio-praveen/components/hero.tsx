import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Phone } from "lucide-react"

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-4">Praveen Kumar</h1>
          <h2 className="text-2xl md:text-3xl text-slate-600 mb-6">Senior Software Engineer</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Specialized in building scalable backend systems, microservices architecture, and performance optimization.
            Proven track record of reducing API response times by 83% and improving system scalability by 30%.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Phone className="w-4 h-4" />
            +91 8769021407
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Mail className="w-4 h-4" />
            praveenkumar.nitb11@gmail.com
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
            <Github className="w-4 h-4" />
            GitHub
          </Button>
        </div>

        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
            View Projects
          </Button>
          <Button variant="outline" size="lg">
            Download Resume
          </Button>
        </div>
      </div>
    </section>
  )
}
