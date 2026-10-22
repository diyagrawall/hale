// General first-aid guidance. It is NOT yet reviewed by a vet: the app says so on every screen.
export type Step = { title: string; do: string; not: string };
export type Topic = { id: string; label: string; icon: string; steps: Step[] };

const SAFE: Step = { title: "Keep yourself safe first", do: "Approach slowly from the side and talk softly. Drape a towel loosely over the head. Wear gloves if you have them.", not: "Do NOT put your face near its mouth or reach over its head." };

export const TOPICS: Topic[] = [
  { id: "bleeding", label: "Heavy bleeding", icon: "alert", steps: [
    SAFE,
    { title: "Press on the wound", do: "Press a clean cloth firmly on the wound for five full minutes without lifting.", not: "Do NOT use turmeric, powder or ash on the wound." },
    { title: "Add layers, do not remove", do: "If blood soaks through, add more cloth on top and wrap a bandage snugly, not tight.", not: "Do NOT remove the cloth to check. It restarts the bleeding." },
    { title: "Keep it calm and go", do: "Lay it on its side, keep it warm and quiet, and get to a vet.", not: "Do NOT give food or water." },
  ] },
  { id: "vehicle", label: "Hit by a vehicle", icon: "truck", steps: [
    { title: "Check the road, then approach", do: "Make sure traffic is stopped or you are safe, then approach slowly from the side.", not: "Do NOT reach over its head or face. Injured animals may bite." },
    { title: "Lift it flat", do: "Slide it onto a board, cardboard or blanket. Support the head, back and hips together.", not: "Do NOT lift by the scruff, legs or tail." },
    { title: "Control bleeding", do: "Press a clean cloth on any bleeding wound. Keep the animal as still as possible.", not: "Do NOT straighten a bent leg or press on the chest." },
    { title: "Keep warm and go now", do: "Cover with a cloth to keep it warm and go straight to a vet. Call ahead if you can.", not: "Do NOT give food or water." },
  ] },
  { id: "fracture", label: "Suspected fracture", icon: "vet", steps: [
    SAFE,
    { title: "Keep it still", do: "Limit movement. Support a hurt leg with a rolled towel in the position you found it.", not: "Do NOT try to straighten or set the bone." },
    { title: "Move it flat", do: "Carry it on a flat surface like a board or a cardboard sheet to a vet.", not: "Do NOT tie a tight splint." },
  ] },
  { id: "heatstroke", label: "Heatstroke", icon: "bolt", steps: [
    { title: "Move it into shade", do: "Carry or guide it into shade or a fan. Lay it on a cool, wet floor.", not: "Do NOT leave it on a hot road or in a closed car." },
    { title: "Cool with tap water", do: "Pour cool tap water over the neck, belly and paws. Fan it. Keep going while you travel.", not: "Do NOT use ice or ice-cold water. It slows cooling." },
    { title: "Offer sips only if alert", do: "If it is awake and standing, offer small sips of water.", not: "Do NOT force water into its mouth." },
    { title: "See a vet today", do: "Even if it recovers, heatstroke can harm the organs. Go to a vet today.", not: "Do NOT wait to see if it gets better." },
  ] },
  { id: "poisoning", label: "Poisoning", icon: "flask", steps: [
    { title: "Remove the source", do: "Move the animal away. Keep the packet, plant or leftovers. The vet needs the name.", not: "Do NOT let it lick paws or fur that touched the poison." },
    { title: "Do not make it vomit", do: "Call a vet now and tell them what, how much, when, and the animal's weight.", not: "Do NOT give salt, oil, milk or put fingers in its mouth." },
    { title: "Go to a vet now", do: "Go straight to a vet and take the packet with you.", not: "Do NOT wait for symptoms to appear." },
  ] },
  { id: "choking", label: "Choking", icon: "alert", steps: [
    { title: "Look in the mouth", do: "Open the mouth gently and look. If you can see the object and lift it out easily, do so.", not: "Do NOT push fingers blindly down the throat." },
    { title: "Go to a vet immediately", do: "Choking is an emergency. Go to the nearest vet at once and call ahead on the way.", not: "Do NOT spend time on home remedies." },
  ] },
  { id: "burns", label: "Burns", icon: "bolt", steps: [
    { title: "Cool the burn", do: "Run cool tap water over the burn for ten minutes.", not: "Do NOT use ice, butter, oil or toothpaste." },
    { title: "Cover loosely", do: "Cover with a clean, damp cloth and go to a vet.", not: "Do NOT burst blisters or peel anything off." },
  ] },
  { id: "maggots", label: "Maggot wound", icon: "alert", steps: [
    { title: "Do not squeeze", do: "Cover the wound loosely with a clean cloth to keep flies away.", not: "Do NOT pour kerosene, turpentine or salt on it." },
    { title: "See a vet today", do: "The wound needs cleaning by a vet. Go today and tell them how long it has been there.", not: "Do NOT pick maggots out by hand." },
  ] },
  { id: "seizure", label: "Seizure", icon: "heartbeat", steps: [
    { title: "Clear the space", do: "Move furniture and sharp things away. Dim the light and keep it quiet. Note the time it started.", not: "Do NOT put your hand or anything in its mouth." },
    { title: "Let it pass", do: "Stay nearby and let it finish. Time the seizure.", not: "Do NOT hold it down." },
    { title: "Go to a vet", do: "Keep it calm and warm afterwards and go to a vet. If it lasts over five minutes, go immediately.", not: "Do NOT give food or water until it is fully alert." },
  ] },
  { id: "lifting", label: "Lift or restrain safely", icon: "hand", steps: [
    { title: "Protect yourself", do: "Approach low and slow from the side. Talk softly. Wear gloves if you have them.", not: "Do NOT reach over its head or face." },
    { title: "Cover the head", do: "Drape a towel loosely over the head. Most animals calm down when they cannot see.", not: "Do NOT tie the mouth tight if the animal is vomiting or struggling to breathe." },
    { title: "Lift flat", do: "Slide it onto a board or blanket. Support the head, back and hips.", not: "Do NOT lift by the scruff, legs or tail." },
  ] },
];

export const BITE_NOTE = "Bitten or scratched? Wash with soap and running water for 15 minutes and get an anti-rabies vaccine today at a government hospital.";

/** Picks a starting topic from the danger words found in a report. */
export function topicFor(flags: string[], injury: string): string {
  const t = (flags.join(" ") + " " + injury).toLowerCase();
  if (/vehicle|run over|hit by|accident/.test(t)) return "vehicle";
  if (/bleed|blood|wound|cut/.test(t)) return "bleeding";
  if (/broken|fractur|dangling|leg/.test(t)) return "fracture";
  if (/poison|foaming/.test(t)) return "poisoning";
  if (/burn|acid/.test(t)) return "burns";
  if (/maggot/.test(t)) return "maggots";
  if (/seizure|fit/.test(t)) return "seizure";
  if (/heat|hot/.test(t)) return "heatstroke";
  if (/chok|breath/.test(t)) return "choking";
  return "lifting";
}
