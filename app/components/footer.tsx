import Image from "next/image"
import Link from "next/link"
import { footerSections,paymentMethods } from "../jsonFiles/footer"
import { Instagram, Facebook } from "lucide-react"

export default function Footer() {

  return (
    <footer className="bg-background border-t border-border pt-16 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Footer Links - Single column on mobile, multiple columns on desktop */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-xs font-medium text-foreground uppercase tracking-[0.15em]">{section.title}</h3>
                  <ul className="space-y-2.5">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-center space-y-4">
                    {/* Oversized brand wordmark */}
        <div className="mb-6">
          <Link href="/" className="text-2xl font-light text-white self-center">
            <Image width={100} height={100} src="/images/glaze-logo-dark.png" alt="Glaze Logo"/>
          </Link>
        </div>
            {/* <h3 className="text-xs font-medium text-foreground uppercase tracking-[0.15em]">追蹤我們</h3> */}
            <div className="flex space-x-5">
              <Link
                href="https://instagram.com"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.25} />
              </Link>
              <Link
                href="https://facebook.com"
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={1.25} />
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-wrap justify-center gap-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="shrink-0">
                  <Image
                    src={method.icon || "/placeholder.svg"}
                    alt={method.name}
                    width={52}
                    height={32}
                    className="h-7 w-auto object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground tracking-wide">
                © 2025 Glaze HK rights reserved. DPMS Category A Registrant (Registration No. A-B-25-01-08658)
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
