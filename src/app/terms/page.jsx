"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import AnnouncementBar from "@/components/announcement-bar";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-grow mt-24 px-4 max-w-[720px] m-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

          <div className="space-y-8 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4">
                By accessing and using DeadDrop, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Service Description
              </h2>
              <p className="mb-4">
                DeadDrop provides a secure file sharing service that allows
                users to upload, encrypt, and share files with others. The
                service includes file encryption, secure storage, and controlled
                access features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You are responsible for maintaining the confidentiality of
                  your encryption keys
                </li>
                <li>
                  You must not upload files that violate any laws or regulations
                </li>
                <li>
                  You must not upload files containing malicious code or malware
                </li>
                <li>
                  You are responsible for the content you share through the
                  service
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. File Storage and Deletion
              </h2>
              <p className="mb-4">
                Files uploaded to DeadDrop are automatically deleted after the
                specified expiration period or when the maximum number of
                downloads is reached. We do not guarantee permanent storage of
                your files.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Privacy and Security
              </h2>
              <p className="mb-4">
                While we implement strong encryption and security measures, we
                cannot guarantee absolute security. Users are responsible for
                maintaining the security of their encryption keys and share
                links.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Service Limitations
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maximum file size: 10MB per file</li>
                <li>
                  Files are automatically deleted after the expiration period
                </li>
                <li>
                  We reserve the right to remove files that violate our terms
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Disclaimer of Warranties
              </h2>
              <p className="mb-4">
                The service is provided &quot;as is&quot; without any
                warranties, expressed or implied. We do not guarantee that the
                service will be uninterrupted or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                8. Limitation of Liability
              </h2>
              <p className="mb-4">
                We shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from your use of or
                inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                9. Changes to Terms
              </h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time.
                Continued use of the service after such modifications
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                10. Contact Information
              </h2>
              <p className="mb-4">
                For any questions regarding these terms, please contact us at{" "}
                <span>contact@deaddrop.space</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
