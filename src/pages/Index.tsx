import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, ArrowRight, ExternalLink } from "lucide-react";
import partnerYenifikir from "@/assets/partner-yenifikir.png";
import partnerBoost from "@/assets/partner-boost.jpeg";

const partners = [
  {
    name: "Yeni Fikir",
    logo: partnerYenifikir,
    bio: "Startap və inkubasiya proqramları təşkil edən, gənclərin innovativ ideyalarını dəstəkləyən təşkilat.",
    website: "https://yenifikir.az/",
  },
  {
    name: "Boost Academy",
    logo: partnerBoost,
    bio: "İmtahanlara hazırlıq və təhsil sahəsində rəqəmsal həllər təqdim edən platforma.",
    website: "https://boost-az-exam.lovable.app/",
  },
];

const Index = () => {
  return (
    <Layout>
      <div className="space-y-24">
        {/* Hero */}
        <section className="text-center py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-3xl" />
          <div className="relative z-10">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 text-sm text-primary font-medium">
              AI Məsləhətçiləri ilə Tanış Olun
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                NeuropayX
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Peşəkar AI məsləhətçiləri ilə əlaqə qurun, layihələrinizi sürətləndirin
              və texnologiya sahəsində irəliləyin.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/consultants">
                <Button size="lg" className="gap-2 text-base px-8">
                  Məsləhətçiləri Kəşf Et <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Qeydiyyat
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Canlı Söhbət</h3>
            <p className="text-muted-foreground leading-relaxed">
              Məsləhətçilərlə real vaxtda söhbət edin, suallarınıza dərhal cavab alın.
            </p>
          </div>

          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Ekspertləri</h3>
            <p className="text-muted-foreground leading-relaxed">
              Süni intellekt, data science və proqramlaşdırma sahəsində təcrübəli mütəxəssislər.
            </p>
          </div>

          <div className="group p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Təhlükəsiz Platforma</h3>
            <p className="text-muted-foreground leading-relaxed">
              Məlumatlarınız qorunur, ödənişlər təhlükəsiz şəkildə həyata keçirilir.
            </p>
          </div>
        </section>

        {/* Partners */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Əməkdaşlarımız</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center text-center p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="h-24 w-24 object-contain rounded-xl mb-5"
                />
                <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{partner.bio}</p>
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  Vebsayta keç <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-16 rounded-2xl border border-border/50 bg-card/30">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hazırsınız?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            İndi qeydiyyatdan keçin və peşəkar məsləhətçilərlə əlaqə qurmağa başlayın.
          </p>
          <Link to="/consultants">
            <Button size="lg" className="gap-2 px-8">
              Başla <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
