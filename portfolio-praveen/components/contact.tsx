import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Github, Linkedin, Send } from "lucide-react"

export function Contact() {
  return (
    <section className="py-20 px-4 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Let's Connect</h2>
        <p className="text-xl text-slate-300 text-center mb-16 max-w-3xl mx-auto">
          Open to discussing new opportunities, technical challenges, and collaborative projects
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-slate-300">praveenkumar.nitb11@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-slate-300">+91 8769021407</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-slate-300">India</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Professional Profiles</h3>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-transparent border-slate-600 text-white hover:bg-slate-800"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-transparent border-slate-600 text-white hover:bg-slate-800"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </Button>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Current Status</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Currently working as MTS2 at Aquera, focusing on SCIM connectors and API optimization. Open to
                discussing senior engineering roles, technical leadership positions, and challenging backend development
                opportunities.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Send a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Input
                  placeholder="Last Name"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <Input
                placeholder="Email Address"
                type="email"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Input
                placeholder="Subject"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Textarea
                placeholder="Your message..."
                rows={6}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
