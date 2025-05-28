import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/10 to-background py-12">
          <div className="container">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Contact</h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground">
              Besoin d'informations supplémentaires ? N'hésitez pas à nous contacter.
            </p>
          </div>
        </section>

        <section className="container py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nos coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="text-muted-foreground">
                        Rue des Tiges 2
                        <br />
                        5330 Assesse (Belgique)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-muted-foreground">
                        <a href="tel:+32487270719" className="hover:text-primary">
                          +32(0)487 27 07 19
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">
                        <a href="mailto:info@panneauxleontine.be" className="hover:text-primary">
                          info@panneauxleontine.be
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Heures d'ouverture</h3>
                      <div className="text-muted-foreground space-y-1">
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Lundi:</span>
                          <span>Fermé</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Mardi:</span>
                          <span>10h00 - 16h00</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Mercredi:</span>
                          <span>10h00 - 16h00</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Jeudi:</span>
                          <span>10h00 - 16h00</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Vendredi:</span>
                          <span>10h00 - 16h00</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Samedi:</span>
                          <span>8h00 - 17h00</span>
                        </p>
                        <p className="grid grid-cols-2 gap-8">
                          <span className="font-medium w-24">Dimanche:</span>
                          <span>Fermé</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video relative rounded-md overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2536.0245456457354!2d5.0022499!3d50.4100247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c1a0e8e2f2b9d9%3A0x9f05a5e0e0e5f5a0!2sRue%20des%20Tiges%202%2C%205330%20Assesse%2C%20Belgique!5e0!3m2!1sfr!2sfr!4v1650000000000!5m2!1sfr!2sfr"
                      width="600"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 w-full h-full"
                      title="Carte Panneaux Léontine - Rue des Tiges 2, Assesse"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Envoyez-nous un message</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-gray-50">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Panneaux Léontine. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="text-sm text-muted-foreground hover:underline">
              Mentions légales
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
