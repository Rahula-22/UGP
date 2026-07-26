import { EVENTS, RITUAL_EXPLAINERS } from "@/lib/mock-data";

export interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: string;
}

export const QUICK_QUESTIONS = [
  "What is the Haldi ceremony?",
  "What should I wear?",
  "Full event schedule?",
  "Is vegetarian food available?",
  "How do I RSVP?",
  "Where are the venues?",
];

function eventCard(name: string): string {
  const ev = EVENTS.find((e) => e.name.toLowerCase() === name.toLowerCase());
  if (!ev) return "";
  const meaning = RITUAL_EXPLAINERS[ev.name]?.English ?? ev.culturalMeaning;
  return `${meaning}\n\n📅 ${ev.date} · ⏰ ${ev.time}\n📍 ${ev.venue}\n👗 Dress code: ${ev.dressCode}`;
}

const scheduleText = () =>
  "Here's the full celebration schedule! 🎉\n\n" +
  EVENTS.map(
    (e) => `• ${e.name} — ${e.date}, ${e.time}\n   📍 ${e.venue}`,
  ).join("\n") +
  "\n\nTap the Multicultural Explainer on any event card to learn what each ritual means!";

const dressText = () =>
  "Great question — here's the dress code for each event: 👗\n\n" +
  EVENTS.map((e) => `• ${e.name}: ${e.dressCode}`).join("\n") +
  "\n\nTip: comfortable footwear for the Sangeet — there WILL be dancing! 💃";

const venueText = () =>
  "Here's where everything happens: 📍\n\n" +
  EVENTS.map((e) => `• ${e.name}: ${e.venue}`).join("\n") +
  "\n\nAll venues have valet parking, and a shuttle runs between the hotel and venues every 30 minutes.";

/** Rule-based mock AI — instant, offline, and wedding-aware. */
export function getBotReply(raw: string): string {
  const q = raw.toLowerCase();

  if (/(^|\s)(hi|hello|hey|namaste|namaskar)\b/.test(q))
    return "Namaste! 🙏 I'm the ShaadiGen Concierge — your personal wedding guide for Aarav & Meera's celebration. Ask me about rituals, timings, venues, dress codes, food, RSVP… anything!";

  if (q.includes("haldi")) return eventCard("Haldi");
  if (q.includes("mehendi") || q.includes("mehndi") || q.includes("henna"))
    return eventCard("Mehendi");
  if (q.includes("sangeet") || q.includes("dance night"))
    return eventCard("Sangeet");
  if (q.includes("phera") || q.includes("saat phere") || q.includes("main wedding") || q.includes("ceremony time"))
    return eventCard("Pheras");

  if (/(schedule|itinerary|timeline|events?|program|when.*(start|begin)|dates?)/.test(q))
    return scheduleText();

  if (/(wear|dress|outfit|attire|clothes|saree|sari|lehenga|sherwani|kurta)/.test(q))
    return dressText();

  if (/(venue|where|location|address|place|reach|directions?|map)/.test(q))
    return venueText();

  if (/(food|menu|eat|dinner|lunch|veg|vegan|jain|gluten|dietary|allerg)/.test(q))
    return "The catering covers everyone! 🍽️\n\n• Vegetarian, Jain (no onion/garlic), Vegan & Gluten-free counters at every event\n• Live chaat & dosa stations at the Sangeet\n• A grand multi-cuisine dinner after the Pheras\n\nJust pick your dietary preference in the RSVP form below and the caterers will take care of the rest.";

  if (/(rsvp|attend|confirm|coming|guest count|plus one|\+1)/.test(q))
    return "RSVPing is easy! Scroll down to the RSVP section on this page:\n\n1️⃣ Tap your attending status\n2️⃣ Pick your dietary preference\n3️⃣ Set the number of guests (up to 10)\n\nHit Submit and you're done — you'll get your personalized itinerary on WhatsApp. 🎊";

  if (/(gift|present|registry|shagun|cash|envelope)/.test(q))
    return "Your presence is truly the greatest gift! 🎁 If you'd still like to give something, a traditional shagun envelope is always cherished. The couple has requested no boxed gifts at the venue — there's a dedicated shagun desk at the reception entrance.";

  if (/(hotel|stay|room|accommodat|lodging|check.?in)/.test(q))
    return "Out-of-town guests are hosted at The Grand Pavilion Hotel, Aerocity (5 min from the Sangeet venue). 🏨 Rooms are blocked under \"Aarav & Meera Wedding\" — mention it at check-in. Complimentary breakfast and shuttle included!";

  if (/(park|car|taxi|cab|shuttle|transport|travel|airport|train|flight)/.test(q))
    return "Getting there is easy: 🚗\n\n• Valet parking at all venues\n• Shuttles between the hotel & venues every 30 min\n• From IGI Airport: ~20 min cab to the hotel\n\nNeed a pickup? Reply to your invite on WhatsApp and the family will arrange one.";

  if (/(weather|hot|cold|rain|temperature)/.test(q))
    return "Late November in Delhi is lovely — sunny days around 24°C and cool evenings near 12°C. 🌤️ Bring a light shawl or jacket for the evening Pheras at the open-air mandap!";

  if (/(kids?|children|baby|family friendly)/.test(q))
    return "Absolutely family-friendly! 👶 There's a supervised kids' corner at the Sangeet and Pheras with games and an early kids' dinner. Include the little ones in your RSVP guest count.";

  if (/(photo|camera|instagram|hashtag|social)/.test(q))
    return "Please do take photos! 📸 The official hashtag is #AaravWedsMeera — tag your posts so the couple sees them. A professional crew covers all events, and you'll receive the highlights album afterwards.";

  if (/(language|hindi|spanish|french|translate|meaning|ritual|tradition|culture)/.test(q))
    return "Every event card on this page has a Multicultural Explainer — tap it to read what each ritual means, and use the language selector to switch between English, हिन्दी, Español and Français! 🌍";

  if (/(contact|planner|help|phone|number|organizer|emergency)/.test(q))
    return "For anything urgent, the wedding planner's desk is reachable via the family's WhatsApp group. 📱 For everything else — I'm right here 24×7, and I never sleep. 😄";

  if (/(thank|shukriya|dhanyavad|great|awesome|nice)/.test(q))
    return "Shukriya! 🙏 So happy to help. Ask me anything else — or scroll down to explore the event schedule and RSVP. See you at the shaadi! 💍";

  return "That's a lovely question! I'm best at wedding topics — try asking about:\n\n• The rituals (Haldi, Mehendi, Sangeet, Pheras)\n• Schedule, venues & dress codes\n• Food & dietary options\n• RSVP, gifts, travel or accommodation\n\nOr tap one of the quick questions below! 💫";
}
