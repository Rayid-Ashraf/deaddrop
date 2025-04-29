import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div className="text-white">
      <Header page="about" />
      <div className="max-w-[720px] mx-auto px-4 mt-12">
        <h1 className="text-5xl font-bold mb-8 ">About</h1>

        <p className="text-xl mb-5">
          <span className="font-bold tracking-wide">DeadDrop</span> is a simple,
          secure, and private way to share files online.
        </p>

        <p className="text-lg text-gray-200 mb-6 leading-relaxed">
          We believe that sharing sensitive information should be fast, safe,
          and effortless — without leaving a trace. DeadDrop was built with
          privacy at its core: files are encrypted before they leave your
          device, and only the person with the correct key can decrypt and
          access them.
        </p>

        <p className="text-lg text-gray-200 mb-10 leading-relaxed">
          Unlike traditional file-sharing services, DeadDrop never stores your
          passwords or private data. We never even see your unencrypted files.
          Everything is designed so that your information remains yours — and
          yours alone.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight">
          How it works
        </h2>
        <ul className="list-disc list-inside text-gray-100 space-y-2 mb-10 ml-2">
          <li className="text-lg">
            <span className="font-bold text-white">Upload</span>: Choose your
            file, name it, and set a passkey.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Encrypt</span>: Your file is
            encrypted locally in your browser.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Share</span>: Send the file
            name and passkey to the recipient.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Access</span>: Anyone with
            the correct key can securely download and decrypt the file.
          </li>
        </ul>

        <p className="text-lg !text-white mb-10 leading-relaxed">
          No signups, no tracking, no nonsense — just secure sharing made
          simple.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight">
          Why DeadDrop?
        </h2>
        <ul className="list-disc list-inside text-gray-100 space-y-2 mb-10 ml-2">
          <li className="text-lg">
            <span className="font-bold text-white">
              Zero-knowledge encryption
            </span>
            : Your data stays yours.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Easy to use</span>: No
            accounts, no complicated setup.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Cross-device</span>: Access
            your files from anywhere.
          </li>
          <li className="text-lg">
            <span className="font-bold text-white">Temporary storage</span>:
            Files can be set to self-destruct after a period of time or after a
            certain number of downloads.
          </li>
        </ul>

        <div className=" text-gray-50 text-xl mb-10 border-l-4 border-white/90  pl-4 py-2">
          DeadDrop was created with the vision of bringing back the{" "}
          <span className="font-semibold">trust</span> and{" "}
          <span className="font-semibold">privacy</span> that the internet once
          promised.
        </div>

        <p className="text-lg text-gray-200 leading-relaxed">
          If you have any questions, ideas, or feedback, feel free to reach out
          at contact@deaddrop.space — we'd love to hear from you.
        </p>
      </div>
      <Footer />
    </div>
  );
}
