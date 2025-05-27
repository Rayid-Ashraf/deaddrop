## 🚀 Getting Started

DeadDrop.space is a secure, anonymous file-sharing platform built to prioritize privacy, control, and simplicity. Unlike typical file-sharing services that ask you to sign up, verify emails, or agree to endless terms, DeadDrop lets you upload and share files without any account.

It was created for people who value discretion and want full control over how their files are shared.

### 🧠 How It Works

DeadDrop takes a different approach. Here's what makes it special:

- You upload a file
- Give it a custom name (like an ID) and a password (like a decryption key)
- The file is encrypted right inside your browser using **AES-256** — a military-grade encryption algorithm
- The encrypted version of the file is uploaded to the server — but the password is **never sent**
- Share the name + password with someone, and they can access the file from anywhere — but only if they have both

This all happens client-side, in the user’s browser, and the password is never stored anywhere. This means only the person who knows both the name and the correct password can access the file.

### 🧱 Zero-Knowledge Architecture

DeadDrop follows a zero-knowledge design, meaning:

- We don’t store your password
- We can’t decrypt your files
- We don’t log any personal data
- Even if someone compromised the server, they’d find only encrypted files with no keys attached — making the data unreadable and meaningless to attackers.

### ⏳ File Expiry & Limits

To give users even more control, DeadDrop lets you:

- Set an expiry duration (e.g., 1 day, 7 days, 30 days)
- Limit the maximum number of downloads

When either limit is reached, the file is automatically and permanently deleted from our storage — no manual cleanup needed.

This makes DeadDrop ideal for one-time or time-sensitive sharing.
## 🛠 Tech Stack

DeadDrop.space is built using modern, reliable technologies to ensure security, performance, and ease of development:

- **Frontend:** [Next.js](https://nextjs.org/) — React framework for server-side rendering and static site generation  
- **Backend & Storage:** [Supabase Storage](https://supabase.com/) — Open source Firebase alternative for storing encrypted files  
- **Encryption:** Web Crypto API with **AES-256 GCM** — Industry-standard encryption performed entirely in the browser  

This stack enables DeadDrop to provide zero-knowledge, privacy-first file sharing without compromising usability.


### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/deaddrop.space.git
cd deaddrop.space
npm install
npm run dev
