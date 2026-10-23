// Seeded demo content for Pune. Everything here is labelled "Demo" in the app.
export type CaseItem = {
  id: string; name: string; species: string; title: string; place: string; clinic: string; ngo: string;
  goal: number; raised: number; donors: number; story: string; tone: "p1" | "p2" | "p3" | "p4"; updates: string[]; coat?: string;
};
export const CASES: CaseItem[] = [
  { id: "moti", coat: "tan", name: "Moti", species: "Dog", title: "Surgery for a broken back leg", place: "Baner", clinic: "Sahyadri Animal Clinic", ngo: "Paws Pune Trust", goal: 21500, raised: 12350, donors: 86, tone: "p1", story: "Moti, a street dog from Baner, was hit by a vehicle on Tuesday. His back leg is broken and he needs surgery tonight. The clinic has confirmed the estimate and every rupee goes straight to the clinic.", updates: ["X-ray done: broken thigh bone", "Surgery booked for tonight", "Volunteer Rohit stayed with Moti until the clinic opened"] },
  { id: "gauri", coat: "white", name: "Gauri", species: "Cow", title: "Rescued from a drain", place: "Hadapsar", clinic: "Karuna Animal Hospital", ngo: "Paws Pune Trust", goal: 12000, raised: 5600, donors: 41, tone: "p2", story: "Gauri fell into an open drain at night. Volunteers pulled her out and she needs wound care and fluids for a week.", updates: ["Pulled out by 6 volunteers", "Wounds cleaned and bandaged"] },
  { id: "mishti", coat: "orange", name: "Mishti", species: "Cat", title: "Kitten with an eye infection", place: "Kothrud", clinic: "Karuna Animal Hospital", ngo: "Kothrud Foster Network", goal: 4500, raised: 2700, donors: 23, tone: "p3", story: "A tiny kitten found near a school. Her eye is swollen shut and she needs medicine and a clean place to recover.", updates: ["Started antibiotic drops"] },
  { id: "tiger", coat: "brown", name: "Tiger", species: "Dog", title: "Tick fever treatment", place: "Aundh", clinic: "Municipal Vet Dispensary", ngo: "Aundh Animal Friends", goal: 6000, raised: 1800, donors: 14, tone: "p4", story: "Tiger is a friendly community dog who is weak and refusing food. Tests show tick fever. He needs a week of treatment.", updates: ["Blood test confirmed tick fever"] },
];
export type Volunteer = { id: string; name: string; area: string; vehicle: string; skills: string[]; km: number; free: boolean; verified: boolean; lessons: number; carrier: boolean };
export const VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Rohit Kulkarni", area: "Baner", vehicle: "scooter", skills: ["Bleeding", "Lifting"], km: 1.1, free: true, verified: true, lessons: 5, carrier: true },
  { id: "v2", name: "Kavya Deshmukh", area: "Aundh", vehicle: "on foot", skills: ["Cats", "Birds"], km: 2.2, free: true, verified: true, lessons: 6, carrier: false },
  { id: "v3", name: "Aamir Shaikh", area: "Hadapsar", vehicle: "car", skills: ["Large animals", "Lifting"], km: 9.4, free: false, verified: true, lessons: 4, carrier: true },
  { id: "v4", name: "Sneha Patil", area: "Koregaon Park", vehicle: "scooter", skills: ["Birds", "Heatstroke"], km: 7.8, free: false, verified: true, lessons: 5, carrier: true },
  { id: "v5", name: "Neha More", area: "Kothrud", vehicle: "on foot", skills: ["Cats"], km: 6.1, free: false, verified: false, lessons: 1, carrier: false },
];
export type GroomService = { name: string; price: number };
export type Groomer = { id: string; name: string; area: string; km: number; rating: number; price: string; services: GroomService[]; offer?: string };
export const GROOMERS: Groomer[] = [
  { id: "g1", name: "Paws & Claws", area: "Baner", km: 1.2, rating: 4.7, price: "₹600–1,500", services: [{ name: "Bath", price: 600 }, { name: "Haircut", price: 900 }, { name: "Nail trim", price: 250 }], offer: "15% off every Wednesday" },
  { id: "g2", name: "Fluffy Tails", area: "Aundh", km: 2.4, rating: 4.5, price: "₹500–1,200", services: [{ name: "Bath", price: 500 }, { name: "De-shedding", price: 700 }, { name: "Nail trim", price: 200 }], offer: "Free nail trim on Sundays" },
  { id: "g3", name: "The Pet Salon", area: "Viman Nagar", km: 9.8, rating: 4.8, price: "₹800–2,000", services: [{ name: "Spa", price: 1200 }, { name: "Haircut", price: 1000 }, { name: "Teeth cleaning", price: 800 }] },
];
export type Food = { id: string; name: string; species: "Dog" | "Cat"; stage: "puppy" | "adult" | "senior" | "all"; allergens: string[]; price: number; kg: number; tags: string[]; offer?: string };
export const FOODS: Food[] = [
  { id: "f1", name: "Lamb & Rice Adult 3 kg", species: "Dog", stage: "adult", allergens: ["lamb"], price: 1450, kg: 3, tags: ["grain-friendly", "sensitive skin"], offer: "Buy 1 get 1 on Fridays" },
  { id: "f2", name: "Chicken & Veg Adult 3 kg", species: "Dog", stage: "adult", allergens: ["chicken"], price: 1250, kg: 3, tags: ["everyday"] },
  { id: "f3", name: "Fish & Sweet Potato Adult 3 kg", species: "Dog", stage: "adult", allergens: ["fish"], price: 1650, kg: 3, tags: ["skin and coat"] },
  { id: "f4", name: "Senior Joint Care Lamb 3 kg", species: "Dog", stage: "senior", allergens: ["lamb"], price: 1750, kg: 3, tags: ["joint support"] },
  { id: "f5", name: "Puppy Growth Chicken 1.5 kg", species: "Dog", stage: "puppy", allergens: ["chicken"], price: 780, kg: 1.5, tags: ["growth"] },
  { id: "f6", name: "Tuna Pâté 12 cans", species: "Cat", stage: "all", allergens: ["fish"], price: 960, kg: 1, tags: ["wet food"] },
  { id: "f7", name: "Turkey & Pumpkin Adult 3 kg", species: "Dog", stage: "adult", allergens: ["turkey"], price: 1550, kg: 3, tags: ["gentle on stomach"] },
];
export type EventItem = { id: string; title: string; inDays: number; time: string; place: string; km: number; kind: "Vaccination camp" | "Adoption drive" | "Meetup" | "Expo" | "Workshop"; host: string; free: boolean; price: number; seats: number };
export const EVENTS: EventItem[] = [
  { id: "e1", title: "Free anti-rabies vaccination camp", inDays: 3, time: "10 am", place: "Baner Community Hall", km: 1.4, kind: "Vaccination camp", host: "Paws Pune Trust", free: true, price: 0, seats: 40 },
  { id: "e2", title: "Adoption drive: meet 20 rescued pups", inDays: 4, time: "11 am", place: "Koregaon Park Lawns", km: 8.1, kind: "Adoption drive", host: "Pune Rescue Network", free: true, price: 0, seats: 100 },
  { id: "e3", title: "Sunday dog meetup with a trainer", inDays: 4, time: "7 am", place: "Aundh Riverside Park", km: 2.6, kind: "Meetup", host: "Aundh Dog Parents", free: false, price: 199, seats: 20 },
  { id: "e5", title: "Puppy first-aid workshop", inDays: 6, time: "4 pm", place: "Baner Pet Hub", km: 1.9, kind: "Workshop", host: "Paws Pune Trust", free: false, price: 399, seats: 25 },
  { id: "e4", title: "Pune Pet Expo", inDays: 11, time: "All day", place: "Shivajinagar Grounds", km: 7.0, kind: "Expo", host: "Pet Expo India", free: false, price: 299, seats: 500 },
];
export type Offer = { id: string; kind: "Grooming" | "Food" | "Event"; partner: string; title: string; weekday: number | null; species?: "Dog" | "Cat"; km?: number };
export const OFFERS: Offer[] = [
  { id: "o1", kind: "Grooming", partner: "Paws & Claws", title: "15% off any grooming today", weekday: 3, km: 1.2 },
  { id: "o2", kind: "Food", partner: "Pet Bazaar", title: "Buy 1 get 1 on Lamb & Rice 3 kg", weekday: 5, species: "Dog" },
  { id: "o3", kind: "Grooming", partner: "Fluffy Tails", title: "Free nail trim with any bath", weekday: 0, km: 2.4 },
  { id: "o4", kind: "Event", partner: "Paws Pune Trust", title: "Free vaccination camp on Saturday", weekday: null },
];
export type Adoptable = { id: string; name: string; species: string; age: string; facts: string[]; ngo: string; tone: "p1" | "p2" | "p3" | "p4"; story: string; coat?: string; young?: boolean };
export const ADOPTABLES: Adoptable[] = [
  { id: "a1", coat: "yellow", young: true, name: "Chiku", species: "Dog", age: "8 months", facts: ["Vaccinated", "Playful"], ngo: "Pune Rescue Network", tone: "p1", story: "Found as a pup under a parked car. Loves belly rubs and is learning to walk on a lead." },
  { id: "a2", coat: "black", young: false, name: "Bella", species: "Dog", age: "2 years", facts: ["Vaccinated", "Sterilised"], ngo: "Paws Pune Trust", tone: "p2", story: "Calm and gentle. Great with children. Waiting for a quiet home." },
  { id: "a3", coat: "grey", young: false, name: "Mimi", species: "Cat", age: "1 year", facts: ["Vaccinated", "Sterilised"], ngo: "Kothrud Foster Network", tone: "p3", story: "Shy at first, then very cuddly. Ready for an indoor home." },
];
export const SHELTERS = [
  { id: "s1", name: "Hadapsar shelter", km: 9.1, free: 3, total: 20, updated: "10 min ago" },
  { id: "s2", name: "Kothrud foster homes", km: 5.4, free: 5, total: 12, updated: "1 h ago" },
  { id: "s3", name: "Wakad recovery kennels", km: 6.0, free: 0, total: 10, updated: "25 min ago" },
];
export const NGO_CASES = [
  { id: "c1", title: "Dog hit by vehicle, bleeding", place: "Baner Rd, Balewadi Phata", km: 1.1, urgency: "Critical", age: "6 min", assigned: "Unassigned", duplicate: true },
  { id: "c2", title: "Cow fell in drain, can't stand", place: "Magarpatta Rd, Hadapsar", km: 9.4, urgency: "Critical", age: "14 min", assigned: "Aamir S. on the way", duplicate: false },
  { id: "c3", title: "Bird, kite string cut on wing", place: "Lane 6, Koregaon Park", km: 7.8, urgency: "Urgent", age: "32 min", assigned: "Sneha P. at the animal", duplicate: false },
  { id: "c4", title: "Dog, maggot wound on ear", place: "Datta Mandir Chowk, Wakad", km: 6.2, urgency: "Urgent", age: "48 min", assigned: "Unassigned", duplicate: false },
];
export const money = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(n);
