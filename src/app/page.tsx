import { Button } from '@/components/ui/button';
import { MainNav } from '@/components/layout/main-nav';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Users, BookCopy, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Welcome to <span className="text-primary">Miftah Platform</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your key to unlocking a brighter educational future in Morocco. Access courses, track progress, and collaborate effectively.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              Platform Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="User Management"
                description="Robust authentication and role-based access for admins, teachers, and students."
              />
              <FeatureCard
                icon={<BookCopy className="h-10 w-10 text-primary" />}
                title="Course Management"
                description="Teachers can easily create courses, upload materials, and manage assignments."
              />
              <FeatureCard
                icon={<TrendingUp className="h-10 w-10 text-primary" />}
                title="Student Dashboard"
                description="Students access course content, submit work, and track their learning progress."
              />
              <FeatureCard
                icon={<CheckCircle className="h-10 w-10 text-primary" />}
                title="Seamless Communication"
                description="RESTful API design ensures smooth interaction between all platform components."
              />
               <FeatureCard
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M10.4 2.19a2 2 0 0 0-1.11.48 2 2 0 0 0-.62 1.75v1.88a2 2 0 0 1-.58 1.41l-4.2 4.2a2 2 0 0 0-.59 1.41v2.83a2 2 0 0 0 .59 1.41l4.2 4.2a2 2 0 0 0 1.41.59h2.83a2 2 0 0 0 1.41-.59l4.2-4.2a2 2 0 0 0 .59-1.41v-2.83a2 2 0 0 0-.59-1.41l-4.2-4.2a2 2 0 0 1-.58-1.41V4.42a2 2 0 0 0-.62-1.75 2 2 0 0 0-1.11-.48z"/>
                        <path d="m14 8-4 4 4 4"/>
                    </svg>
                }
                title="Primary Education"
                description="Tailored content and tools for foundational learning stages."
              />
               <FeatureCard
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                }
                title="Middle & Secondary"
                description="Advanced courses and resources for developing critical skills and knowledge."
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  About Miftah
                </h2>
                <p className="text-muted-foreground mb-4">
                  Miftah, meaning 'key' in Arabic, is an initiative to revolutionize education in Morocco by providing a modern, accessible, and comprehensive e-learning platform.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our mission is to empower students and educators with the tools they need for success, fostering a collaborative and engaging learning environment.
                </p>
                <p className="text-muted-foreground">
                  Built with cutting-edge technologies like React, Node.js, and PostgreSQL, Miftah is designed for scalability and reliability.
                </p>
              </div>
              <div>
                <Image
                  src="https://picsum.photos/seed/education-morocco/600/400"
                  alt="Moroccan students learning"
                  data-ai-hint="students Morocco"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-background border-t border-border/40">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Miftah Platform. All rights reserved.</p>
          <p className="text-sm mt-1">Empowering Education in Morocco.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}
