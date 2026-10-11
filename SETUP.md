# Settl: wallet setup

This gets you from "never used a crypto wallet" to paying into a Settl deal. It takes about ten minutes per person. No real money is involved at any point.

There are two ways to run Settl. Pick one.

| | Local mode | Testnet mode |
|---|---|---|
| Command | `npm start` | `npm run testnet` |
| Where the vault lives | On a test chain inside your laptop | On Sepolia, a public test network |
| Test money | Given automatically when you connect | You collect it once from a faucet (free) |
| Needs internet | No | Yes |
| Who can join | Accounts in one browser on one laptop | Anyone who can open your laptop's address |

Start with local mode to learn the flow. Use testnet mode to show a real public deployment.

## 1. Install MetaMask (everyone)

1. Open Chrome, Edge or Brave and go to `https://metamask.io/download`.
2. Click **Add to Chrome** (or your browser), then **Add extension**.
3. Choose **Create a new wallet** and set a password.
4. MetaMask shows 12 words, the Secret Recovery Phrase. Write them on paper.
5. Pin MetaMask to the toolbar: click the puzzle icon, then the pin next to MetaMask.

Two rules:

- Never type or paste the 12 words or a private key into any website, chat or form. Settl never asks for them.
- Use this new wallet for the hackathon only. Do not use a wallet that holds real money.

Your **address** is the long code starting with `0x` at the top of MetaMask. It is public, like an account number. You can share it freely.

## 2. One laptop, several people

For a demo on one laptop you can play every person yourself:

1. In MetaMask click the account name at the top, then **Add account**.
2. Add one account per person in the deal, for example Riya, Aman and Meera.
3. To act as another person, switch the account in MetaMask. Settl follows the switch and asks that account to sign in.

## 3. Local mode

1. In the project folder run `npm install` once, then `npm start`.
2. Open `http://localhost:3000`.
3. Click **Connect**. MetaMask asks to add a network called "Settl Local". Approve it.
4. Type your name when asked and approve the sign-in message. Signing in costs nothing.
5. Your account now holds 10,000 test ETH. In Settl, ₹1,000 is 1 test ETH.

If you restart the server, the local chain starts again from nothing and MetaMask can get confused. Fix: MetaMask → Settings → Advanced → **Clear activity tab data**.

## 4. Testnet mode (Sepolia)

### Get test ETH

Only one person needs to do this. They can then share it.

1. In MetaMask open the network list (top left), turn on **Show test networks** and choose **Sepolia**.
2. Copy your address.
3. Open a Sepolia faucet, paste the address and request test ETH. Faucets to try, in this order:
   - `https://cloud.google.com/application/web3/faucet/ethereum/sepolia` (sign in with a Google account)
   - `https://sepolia-faucet.pk910.de`
   - `https://faucets.chain.link/sepolia`
4. Wait a minute. The balance appears in MetaMask under Sepolia.
5. Send a little to each friend: MetaMask → **Send** → paste their address → `0.005` → confirm. Do the same for your own extra accounts if you are playing several people.

Faucets change their rules often. If one refuses, try the next.

What it costs: creating a vault is the expensive step. With MetaMask's default fee it took about 0.02 test ETH on Sepolia; Settl now asks for a smaller fee, which should bring it to about 0.002. Every other step costs far less. The organiser needs the most; 0.002 each is plenty for everyone else. Check the fee MetaMask shows before you confirm.

### Run Settl on Sepolia

1. Run `npm run testnet`.
2. Open `http://localhost:3000` and click **Connect**. MetaMask switches to Sepolia.
3. Friends on the same Wi-Fi can join from their own laptops. Run `ipconfig`, find your IPv4 address, and give them `http://YOUR-IP:3000`. Allow Node.js through the Windows firewall if asked.

On Sepolia, ₹1,000 is 0.000001 test ETH, so a ₹30,000 deal moves 0.00003 test ETH. Every vault and payment can be opened on `https://sepolia.etherscan.io`.

To use another test network, put its address in `.env` as `CHAIN_RPC_URL=` and run `npm start`. Settl refuses to start on a network that uses real money.

## 5. Run a deal

1. **Describe it.** Type the deal in the bar at the top and press Enter. Use the names people signed in with.
   Example: `Riya pays ₹30,000 for a website. Aman is paid ₹30,000 when the site is live. Meera settles any dispute.`
2. **Add people.** Anyone who has not connected yet shows an empty box next to their name. Paste their wallet address there. When they connect with that wallet, they are that person.
3. **Confirm.** Read what Settl understood. If it is wrong, edit the words and read again. Then click **Confirm**.
4. **Sign.** Each person opens the deal with their own account and clicks **Sign**. This moves no money.
5. **Create vault.** The organiser clicks **Create vault** and approves it in MetaMask. The contract is now on the chain.
6. **Deposit.** Each payer clicks **Deposit** and approves it. The money is now locked in the vault.
7. **Work and pay.** The person doing a stage clicks **Done**. The payers click **Approve**, or **Dispute** to send it to the judge.
8. **Withdraw.** Whoever is owed money clicks **Withdraw** and it arrives in their wallet.

Every step that needs a wallet opens MetaMask. If the contract would refuse a step, Settl says why before MetaMask opens.

## If something goes wrong

| What you see | What to do |
|---|---|
| "No wallet found" | Install MetaMask, then reload the page. |
| MetaMask shows the wrong network | Click the action again and approve the network switch. |
| "This session has ended" | The server restarted. Click **Connect** again. |
| A transaction is stuck or says "nonce too high" (local mode) | MetaMask → Settings → Advanced → Clear activity tab data. |
| "This wallet does not hold enough" | Get more test ETH (testnet), or reconnect (local). |
| The faucet refuses | Try another faucet, or use local mode. |
| The AI is unavailable | Settl reads the deal with its built-in offline reader. Nothing else changes. |
