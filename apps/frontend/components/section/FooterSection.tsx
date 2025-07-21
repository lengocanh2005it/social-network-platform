"use client";
import NewsletterInput from "@/components/input/NewsletterInput";
import { motion } from "framer-motion";
import { SiFacebook, SiInstagram, SiLinkedin, SiX } from "react-icons/si";

const FooterSection = () => {
  const socialIcons = [
    { icon: SiFacebook, href: "https://facebook.com" },
    { icon: SiX, href: "https://twitter.com" },
    { icon: SiInstagram, href: "https://instagram.com" },
    { icon: SiLinkedin, href: "https://linkedin.com" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-neutral-100 dark:bg-neutral-900 text-gray-800 dark:text-gray-200 pt-16 
      pb-10 border-t border-gray-200 dark:border-gray-700 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col md:gap-3 gap-2">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            SocialNet
          </h2>
          <p className="text-sm leading-relaxed">
            Connect, share and explore with people around the world.
          </p>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-500 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-500 transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-md font-semibold mb-4">Newsletter</h3>
          <p className="text-sm mb-3">Stay up to date with our latest news.</p>
          <NewsletterInput />
        </div>

        <div>
          <h3 className="text-md font-semibold mb-4">Follow Us</h3>
          <div className="flex items-center gap-4">
            {socialIcons.map(({ icon: Icon, href }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-neutral-800 rounded-full 
                hover:bg-indigo-500 hover:text-white transition"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} SocialNet. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default FooterSection;
