require("dotenv").config();
const ethers = require("ethers");
const nodemailer = require("nodemailer");
const chalk = require("chalk");

// Setting ENV Variables
const wallets = process.env.WALLETS.split(",");
const emailRecipient = process.env.EMAIL;
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const networks = {
  "op-sepolia": "https://sepolia.optimism.io",
  "base-sepolia": "https://sepolia.base.org",
  "arbitrum-sepolia": "https://sepolia-rollup.arbitrum.io/rpc",
  blast: "https://sepolia.blast.io",
  "unichain-sepolia": "https://unichain-sepolia.drpc.org",
};

//Transporter :
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

async function checkBalances() {
  const lowBalanceAlerts = []; // Array to store alerts to send

  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];

    // Title for each wallet
    console.log(chalk.bgCyan.underline(`Processing Wallet ${wallet}`));

    console.log("--------------------------------------------------"); // Horizontal line separator
    for (const [networkName, rpc] of Object.entries(networks)) {
      const provider = new ethers.JsonRpcProvider(rpc);
      try {
        const balance = await provider.getBalance(wallet);
        const balanceInEth = ethers.formatEther(balance);
        const balanceRounded = parseFloat(balanceInEth).toFixed(4); // Limit to 4 decimal places

        let logMessage = `Wallet: ${wallet} - ${networkName}: ${balanceRounded} ETH`;

        if (parseFloat(balanceRounded) < 5) {
          logMessage = chalk.red(logMessage); // Color the line red if balance is low
          lowBalanceAlerts.push({
            wallet,
            network: networkName,
            balance: balanceRounded,
          }); // Store the alert
        }

        console.log(logMessage);
      } catch (error) {
        console.error(`Error checking balance on ${networkName}:`, error);
      }
    }
    // Add separation line after processing the last network of the wallet
    if (i < wallets.length - 1) {
      console.log("\n");
    }
  }

  // Title before sending emails
  console.log("\n");
  console.log("\n");
  console.log(chalk.bgGreen.underline("Sending Emails"));

  // Send emails after all balances are checked
  for (const alert of lowBalanceAlerts) {
    await sendEmailAlert(alert.wallet, alert.network, alert.balance); // Await the email sending
  }
}

async function sendEmailAlert(wallet, network, balance) {
  const mailOptions = {
    from: emailUser,
    to: emailRecipient,
    subject: `⚠️ Low Balance Alert for ${wallet}`,
    html: `The balance of wallet ${wallet} on <b>${network}</b> has dropped below 5 ETH. Current balance: ${balance} ETH.`, // Network in bold with HTML
    text: `The balance of wallet ${wallet} on ${network} has dropped below 5 ETH. Current balance: ${balance} ETH.`, // fallback
  };

  try {
    const info = await transporter.sendMail(mailOptions); // Use await for asynchronous sendMail
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Check Balances Every 30 minutes
setInterval(checkBalances, 30 * 60 * 1000);

// Run the script for the first time
checkBalances();
