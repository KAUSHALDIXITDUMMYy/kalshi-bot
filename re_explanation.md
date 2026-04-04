Listed directory internal
Listed directory kalshi
Viewed client.go:1-105
Listed directory ws
Viewed client.go:1-119

To help you get a clear picture, I have broken down the bot's communication with Kalshi into the exact technical "lines of code" (Endpoints) and the "story" of how a trade happens (Logic Flow).

---

### 1. The Technical Endpoints
The bot uses two types of communication: **WebSocket** (for listening) and **REST** (for taking action).

#### **WebSocket (The Listening Line)**
*   **Endpoint:** `wss://api.elections.kalshi.com/trade-api/ws/v2`
*   **What happens here:** The bot opens a persistent connection and sends a "Subscribe" message to the **`communications`** channel. This channel is specifically for private, high-speed negotiation between you and a requester. It's like a private chat room for trading.

#### **REST API (The Action Steps)**
*   **Base URL:** `https://api.elections.kalshi.com/trade-api/v2`
*   **Step A: Submit a Quote**
    *   **Endpoint:** `POST /communications/quotes`
    *   **Action:** Used to say, "I'm interested in this RFQ, here is my price."
*   **Step B: Confirm a Quote**
    *   **Endpoint:** `PUT /communications/quotes/{quote_id}/confirm`
    *   **Action:** Used when the other person says "I accept your price." You must send this final confirmation to finalize the contract.

---

### 2. The Logic Flow (The "Story")

Here is the step-by-step journey of a single trade from the bot's perspective:

#### **Stage 1: The Trigger (Someone wants a price)** 
1.  **The Event:** An unknown trader (the Requester) wants to buy a large amount of "Yes" contracts on a specific market.
2.  **The Message:** Kalshi sends a message over the **WebSocket** to your bot: `"rfq_created"`. It contains details like the Market ID, the number of contracts, and a Unique ID for this request.

#### **Stage 2: The Calculation (Bot decides the price)**
1.  **The Check:** The bot checks if it's in "Dry Run" mode.
2.  **The Strategy:** The bot looks at `internal/pricing`. Right now, it just looks at your `.env` file to see the `KALSHI_FIXED_YES_BID`.
3.  **The Decision:** The bot calculates: *"I'll offer to buy these at 50¢ each."*

#### **Stage 3: The Response (Bot sends its offer)**
1.  **The Quote:** The bot sends a **REST POST** request to `/communications/quotes` with your price and the RFQ ID. 
2.  **The Tracking:** The bot receives a `quote_id` back from Kalshi and remembers it: *"This is my offer #12345."*

#### **Stage 4: The Closing (The trade is made)**
1.  **The Acceptance:** If the Requester likes your 50¢ price, Kalshi sends a **WebSocket** message: `"quote_accepted"`. 
2.  **The Identification:** The bot looks at the ID in that message. If it matches `#12345` (your quote), it knows it's time to finish the deal.
3.  **The Confirmation:** The bot sends a **REST PUT** request to `/communications/quotes/12345/confirm`. 
4.  **Success:** The trade is now "Cleared." The money moves, and the contracts are issued.

---

### Why is this needed?
On traditional stock exchanges, you just "put an order on the book" and wait. On Kalshi's RFQ system, big trades happen via this **active negotiation**. 

**Your job as a developer for this bot will be:**
1.  Making the **Pricing Strategy** smarter (Stage 2).
2.  Ensuring the **WebSocket** is stable so you never miss a request (Stage 1).
3.  Handling **Error Responses** if a quote is rejected or if you run out of money (Stage 3 & 4).

Does this sequence make sense, or should I dive deeper into any specific message type?