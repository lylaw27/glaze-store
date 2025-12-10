import Image from "next/image"
import Link from "next/link"
import { footerSections,paymentMethods } from "../jsonFiles/footer"
import { Instagram, Facebook } from "lucide-react"

export default function Footer() {

  return (
    <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Footer Links - Single column on mobile, multiple columns on desktop */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
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

          {/* Brand and Social Media */}
          <div className="lg:col-span-1 flex flex-col items-center lg:items-end space-y-4">
            <div className="text-center lg:text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">White on</h2>
              <div className="flex space-x-4 justify-center lg:justify-end">
                <Link
                  href="https://instagram.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </Link>
                <Link
                  href="https://facebook.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex-shrink-0">
                  <Image
                    src={method.icon || "/placeholder.svg"}
                    alt={method.name}
                    width={52}
                    height={32}
                    className="h-8 w-auto object-contain border border-gray-200 rounded"
                  />
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                © 2025 White on all rights reserved. DPMS Category A Registrant (Registration No. A-B-25-01-08658)
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
