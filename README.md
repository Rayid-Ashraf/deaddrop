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

### 🌍 Who Is It For?

DeadDrop is useful for anyone who wants to share files safely, privately, and without friction:

- 👩‍🏫 Teachers sharing class notes, assignments, or answer sheets  
- 🧑‍💻 Developers sending builds, config files, or access tokens  
- 🕵️ Journalists and whistleblowers sharing sensitive information securely  
- 💼 Freelancers delivering final work to clients without setting up file drives  
- 🤝 Teams who need to pass around credentials, license keys, or one-time files  

If you’ve ever hesitated to send a file over email, chat apps, or cloud drives because of privacy concerns, DeadDrop is for you.

### 🚀 Why It Stands Out

- 🔐 End-to-end encryption: Strong AES-256 encryption done entirely in the browser  
- 🛡️ Zero-knowledge storage: We literally can’t read your files  
- 🧾 No signups or user data: Completely anonymous usage  
- 🧩 Cross-platform: Works on any modern browser — phone, tablet, or desktop  
- ⏳ Auto-expiry + download limits: Files are deleted when no longer needed  

---

### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/deaddrop.space.git
cd deaddrop.space
npm install
npm run dev
