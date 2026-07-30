# 💍 ShaadiGen AI

A fully interactive MVP web prototype for a Generative AI-powered platform reimagining the Indian Wedding Industry.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4** and **lucide-react**. Most AI behaviour (negotiation, song composition, guest chat) is simulated client-side. **Virtual Try-On** can call a real backend when you configure cloud credentials.

## Modules

| Route | Module |
| --- | --- |
| `/` | Landing dashboard with hero, feature cards & live budget calculator |
| `/vendors` | 🤝 Budget Vendor Matchmaker — budget slider (₹5L–₹1Cr), category tabs, AI negotiation modal |
| `/shopping-hub` | 🛍️ Local Shopping Discovery — Top 10 Chandni Chowk lehenga shops guide with search & budget filters |
| `/ai-studio` | 🎨 AI Visual Studio — **photo upload + AWS Nova Canvas virtual try-on**, lighting simulator, 4K pre-wedding shoot generator |
| `/media-suite` | 🎵 AI Media Suite — love song generator with mock audio player & live invitation card editor |
| `/guest-hub` | 💒 "Join My Wedding" Guest Portal — multilingual ritual explainers, RSVP & Concierge chatbot |

## Getting Started

```bash
npm install
cp .env.example .env.local   # optional — needed for real try-on
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Virtual Try-On backend

1. Enable **Amazon Nova Canvas** in the AWS Bedrock console (region must match `AWS_REGION`).
2. Create an IAM user/role with `bedrock:InvokeModel` (and optional `s3:PutObject` if using `TRYON_S3_BUCKET`).
3. Put keys in `.env.local` (see `.env.example`).
4. Open `/ai-studio`, upload a full-body photo, pick an outfit, click **Try on**.

`POST /api/try-on` accepts multipart fields `person`, `outfitId` (`lehenga` | `sherwani` | `jewelry`), and optional `lightingId`.

Switch providers with `TRYON_PROVIDER`:

| Value | Credits / service |
| --- | --- |
| `aws-nova` (default) | AWS Bedrock Nova Canvas `VIRTUAL_TRY_ON` |
| `openai` | OpenAI Images Edit or Azure OpenAI image deployment |
| `vertex` | Google Vertex AI `virtual-try-on-001` (+ `GOOGLE_ACCESS_TOKEN`) |

Garment reference images live in `public/garments/`. Replace them with real product photos for better results.

## Project Structure

- `types/wedding.ts` — shared domain interfaces (Vendor, ShoppingGuideItem, PreWeddingShoot, CustomSong, AIInviteCard, EventDetail)
- `lib/mock-data.ts` — seed data: vendors, Chandni Chowk shop guides, wedding events, multilingual ritual explainers
- `lib/tryon/` — virtual try-on providers (AWS Nova, OpenAI/Azure, Vertex) + garment mapping
- `app/api/try-on/` — multipart API route for try-on
- `components/` — navbar, budget context (shared across pages), toast notification system, guest chatbot
- `app/` — one route per module
