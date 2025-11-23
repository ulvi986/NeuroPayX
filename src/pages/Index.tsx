import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-16">
        <section className="text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to NeuropayX
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your premier marketplace for templates, expert consultations, and professional communities
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/templates">
              <Button size="lg">Browse Templates</Button>
            </Link>
            <Link to="/consultants">
              <Button size="lg" variant="outline">Find Consultants</Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Template Marketplace</h3>
              <p className="text-muted-foreground">
                Discover and purchase premium templates for your projects
              </p>
              <Link to="/templates">
                <Button variant="link">Explore Templates →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Expert Consultants</h3>
              <p className="text-muted-foreground">
                Get personalized guidance from industry experts
              </p>
              <Link to="/consultants">
                <Button variant="link">Find Consultants →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Community Groups</h3>
              <p className="text-muted-foreground">
                Join communities and connect with professionals
              </p>
              <Link to="/community">
                <Button variant="link">Explore Communities →</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
