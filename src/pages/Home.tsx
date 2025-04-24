
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, FileCheck, Clock, FileText } from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-b from-ndt-900 to-ndt-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            NDT Hours Verified
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Track, manage, and verify your NDT certification hours with our secure platform.
            Simplify your certification process with tamper-evident verification.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            {!user ? (
              <>
                <Button
                  size="lg"
                  className="bg-white text-ndt-800 hover:bg-gray-100"
                  asChild
                >
                  <Link to="/register">Create an Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                className="bg-white text-ndt-800 hover:bg-gray-100"
                asChild
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
          <div className="mt-12">
            <img
              src="/placeholder.svg"
              alt="NDT Hours Verified Dashboard"
              className="mx-auto rounded-lg shadow-lg max-w-full md:max-w-4xl"
              style={{ height: "300px", width: "600px", objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simplify Your NDT Certification Process
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-ndt-600" />}
              title="Track Hours"
              description="Easily log and track your NDT experience hours across different methods and companies."
            />
            <FeatureCard
              icon={<CheckCircle className="h-10 w-10 text-ndt-600" />}
              title="Verify Experience"
              description="Request and receive digital verification from supervisors with tamper-evident signatures."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-ndt-600" />}
              title="Generate Reports"
              description="Create professional PDF reports for certification submissions and renewal."
            />
            <FeatureCard
              icon={<FileCheck className="h-10 w-10 text-ndt-600" />}
              title="Rope Access Integration"
              description="Specialized tracking for rope access work hours and certification requirements."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ndt-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to streamline your certification process?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of NDT professionals who trust our platform to manage their certification hours.
          </p>
          {!user ? (
            <Button size="lg" className="bg-ndt-600 hover:bg-ndt-700" asChild>
              <Link to="/register">Get Started Today</Link>
            </Button>
          ) : (
            <Button size="lg" className="bg-ndt-600 hover:bg-ndt-700" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Testimonials section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by NDT Professionals
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="This platform has made my NDT certification process so much easier. No more paper logbooks or chasing supervisors for signatures."
              author="John D."
              title="Level II RT Technician"
            />
            <TestimonialCard
              quote="The signature verification system gives me confidence that my hours are securely documented and tamper-proof."
              author="Sarah M."
              title="Level III UT Technician"
            />
            <TestimonialCard
              quote="As a supervisor, I appreciate how easy it is to verify my team's hours. The email system is straightforward and secure."
              author="Michael T."
              title="NDT Department Manager"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const TestimonialCard = ({ quote, author, title }: { 
  quote: string; 
  author: string; 
  title: string;
}) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-gray-500 text-sm">{title}</p>
      </div>
    </div>
  );
};

export default Home;
