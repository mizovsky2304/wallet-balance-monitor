require("dotenv").config();
const ethers = require("ethers");
const nodemailer = require("nodemailer");

// Configuration des variables d'environnement
const wallets = process.env.WALLETS.split(",");
const emailRecipient = process.env.EMAIL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const networks = {
  "op-sepolia": "https://sepolia.optimism.io",
  "base-sepolia": "https://sepolia.base.org",
  "arbitrum-sepolia": "https://sepolia-rollup.arbitrum.io/rpc",
  "blast:": "https://sepolia.blast.io",
  "unichain-sepolia": "https://unichain-sepolia.drpc.org",
};

// Transporteur pour l'envoi d'emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

async function checkBalances() {
  for (const wallet of wallets) {
    for (const [networkName, rpc] of Object.entries(networks)) {
      const provider = new ethers.JsonRpcProvider(rpc);
      try {
        const balance = await provider.getBalance(wallet);
        const balanceInEth = ethers.formatEther(balance);
        console.log(`Wallet: ${wallet} - ${networkName}: ${balanceInEth} ETH`);

        if (parseFloat(balanceInEth) < 5) {
          sendEmailAlert(wallet, networkName, balanceInEth);
        }
      } catch (error) {
        console.error(`Error checking balance on ${networkName}:`, error);
      }
    }
  }
}

function sendEmailAlert(wallet, network, balance) {
  const mailOptions = {
    from: emailUser,
    to: emailRecipient,
    subject: `⚠️ Low Balance Alert for ${wallet}`,
    text: `The balance of wallet ${wallet} on ${network} has dropped below 5 ETH. Current balance: ${balance} ETH.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

// Vérifier les soldes toutes les 30 minutes
setInterval(checkBalances, 30 * 60 * 1000);

// Lancer immédiatement une première vérification
checkBalances();
