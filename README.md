# Wallet Balance Monitor Tool [useful for t3rn executor]

## 📌 Overview
This Node.js script monitors the balance of an EVM wallet across multiple networks and sends an automatic email alert if the balance falls below **5 ETH**. The script runs in a **VPS session** (`screen`) and checks the wallet balance every **10 minutes**.

## 🚀 Features
- Supports multiple EVM testnet networks:  
  - **OP Sepolia**  
  - **Base Sepolia**  
  - **Arbitrum Sepolia**  
  - **Blast**  
  - **Unichain Sepolia**  
- Sends an **email alert** when the balance is below **5 ETH**.  
- Runs automatically in a **screen session** on a VPS.  

---

## 🛠️ Installation

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/mizovsky2304/wallet-balance-monitor.git
cd wallet-balance-monitor
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Configure Environment Variables**
Create a `.env` file in the root folder and add the following variables:

```ini
WALLET_ADDRESS=your_wallet_address
EMAIL=recipient_email@example.com
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

### 4️⃣ **Run the Script**
Start the script manually:
```sh
node index.js
```

Or run it in a **screen session** (recommended for VPS):
```sh
screen -S wallet-monitor -dm node index.js
```
To reattach the session:
```sh
screen -r wallet-monitor
```

---

## ⚙️ How It Works
1. The script **checks the wallet balance** on the supported networks every **10 minutes**.
2. If the balance drops **below 5 ETH**, an **email alert** is sent to the configured email.
3. The script continues running **automatically**.

---

## 📩 Email Configuration
This script uses **nodemailer** for sending emails.  
If you're using **Gmail**, enable "Less secure apps" or create an **App Password** in your Google account.

For other email providers, update the SMTP settings in the script.

---

## 📝 License
This project is **open-source** under the MIT License.

---

### 💡 Contributions & Issues
If you find a bug or want to suggest improvements, feel free to open an issue or create a pull request.

Happy Ramadan! 🚀
