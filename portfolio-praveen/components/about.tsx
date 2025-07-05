import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, MapPin } from "lucide-react"

export function About() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">About Me</h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">Professional Journey</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                With 3+ years of experience in software engineering, I specialize in building high-performance backend
                systems and scalable microservices architectures. My expertise spans across Node.js, Java, Python, and
                cloud technologies.
              </p>
              <p className="text-slate-700 leading-relaxed">
                I have successfully led teams, optimized critical systems achieving 83% performance improvements, and
                delivered solutions that directly impact business metrics and operational efficiency.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6">Education</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-slate-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-900">Bachelor of Technology</h4>
                    <p className="text-slate-600">Electronics and Communication</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Maulana Azad National Institute of Technology, Bhopal
                    </p>
                    <p className="text-sm text-slate-500">CGPA: 7.32 | 2017-2021</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
