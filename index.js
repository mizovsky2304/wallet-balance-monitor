const { ethers } = require("ethers");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Configuration des RPCs des réseaux
const networks = {
  "op-sepolia": "https://sepolia.optimism.io",
  "base-sepolia": "https://sepolia.base.org",
  "arbitrum-sepolia": "https://sepolia-rollup.arbitrum.io/rpc",
  "blast:": "https://sepolia.blast.io",
  "unichain-sepolia": "https://unichain-sepolia.drpc.org",
};

const walletAddress = process.env.WALLET_ADDRESS;
const recipientEmail = process.env.EMAIL;

if (!walletAddress || !recipientEmail) {
  console.error(
    "Veuillez définir WALLET_ADDRESS et EMAIL dans le fichier .env"
  );
  process.exit(1);
}

// Configurer le transporteur d'email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function checkBalances() {
  for (const [network, rpc] of Object.entries(networks)) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      const balance = await provider.getBalance(walletAddress);
      const balanceInEth = ethers.formatEther(balance);

      console.log(`${network}: ${balanceInEth} ETH`);

      if (parseFloat(balanceInEth) < 5) {
        await sendEmailAlert(network, balanceInEth);
      }
    } catch (error) {
      console.error(`Erreur sur ${network}:`, error);
    }
  }
}

async function sendEmailAlert(network, balance) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Alerte de balance faible sur ${network}`,
    text: `La balance du wallet ${walletAddress} sur ${network} est de ${balance} ETH, en dessous du seuil de 5 ETH.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email envoyé pour ${network}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
  }
}

// Vérifier toutes les 10 minutes
setInterval(checkBalances, 10 * 60 * 1000);

// Lancer la première vérification immédiatement
checkBalances();
