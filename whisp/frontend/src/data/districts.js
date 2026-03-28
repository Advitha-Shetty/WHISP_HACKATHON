// data/districts.js — WHISP District Dataset

export const DISTRICTS = [
  {
    id: 1, name: "Ballari", state: "Karnataka",
    anaemia: 58, menstrualHygiene: 62, awareness: 42, menopauseSupport: 28,
    funding: 25, allocated: 23, utilized: 17,
    padCenters: 18, clinics: 12, programs: 6,
    lat: 15.15, lng: 76.92, risk: "High",
    population: 280000,
    trend: [48, 50, 52, 55, 55, 58]
  },
  {
    id: 2, name: "Bagalkot", state: "Karnataka",
    anaemia: 65, menstrualHygiene: 70, awareness: 60, menopauseSupport: 45,
    funding: 20, allocated: 19, utilized: 15,
    padCenters: 22, clinics: 15, programs: 8,
    lat: 16.18, lng: 75.70, risk: "Moderate",
    population: 195000,
    trend: [52, 55, 58, 60, 62, 65]
  },
  {
    id: 3, name: "Kalaburagi", state: "Karnataka",
    anaemia: 72, menstrualHygiene: 65, awareness: 55, menopauseSupport: 38,
    funding: 30, allocated: 28, utilized: 14,
    padCenters: 15, clinics: 10, programs: 4,
    lat: 17.33, lng: 76.82, risk: "High",
    population: 320000,
    trend: [60, 62, 62, 65, 68, 72]
  },
  {
    id: 4, name: "Bangalore Rural", state: "Karnataka",
    anaemia: 45, menstrualHygiene: 80, awareness: 75, menopauseSupport: 62,
    funding: 18, allocated: 17, utilized: 16,
    padCenters: 30, clinics: 25, programs: 12,
    lat: 13.22, lng: 77.57, risk: "Low",
    population: 110000,
    trend: [38, 40, 42, 44, 44, 45]
  },
  {
    id: 5, name: "Uttara Kannada", state: "Karnataka",
    anaemia: 40, menstrualHygiene: 82, awareness: 78, menopauseSupport: 70,
    funding: 15, allocated: 14, utilized: 13,
    padCenters: 28, clinics: 22, programs: 14,
    lat: 14.79, lng: 74.68, risk: "Low",
    population: 95000,
    trend: [32, 34, 36, 38, 39, 40]
  }
];

export const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CITIZEN_REPORTS = [
  { id: 1, district: "Ballari", type: "No Pads Available", location: "Kudligi Town", time: "2h ago", status: "Open" },
  { id: 2, district: "Kalaburagi", type: "Clinic Not Working", location: "Civil Hospital", time: "5h ago", status: "Investigating" },
  { id: 3, district: "Bagalkot", type: "No Awareness Program", location: "Mudhol Block", time: "1d ago", status: "Open" },
  { id: 4, district: "Ballari", type: "Wrong Location", location: "Hospet PHC", time: "2d ago", status: "Resolved" }
];

export const NEARBY_SERVICES = [
  { id: 1, name: "Kudligi Primary Health Center", type: "clinic", tags: ["Free Pads", "OPD"], dist: "3.2 km", hours: "10:00 AM – 5:00 PM", open: true },
  { id: 2, name: "Siruguppa Anganwadi Center", type: "pad", tags: ["Free Pads"], dist: "5.8 km", hours: "Closes in 2hrs", open: true },
  { id: 3, name: "Bellari Urban PHC", type: "clinic", tags: ["Free Pads"], dist: "7.1 km", hours: "9:00 AM – 8:00 PM", open: true },
  { id: 4, name: "Hospet Government Hospital", type: "clinic", tags: ["Low-Cost ITN"], dist: "12.6 km", hours: "Open 24 Hours", open: true }
];

export const AWARENESS_PROGRAMS = [
  {
    date: "Apr 24", title: "Free Hygiene Session for Girls",
    venue: "Govt. High School, Kampli",
    tags: ["Open for All", "Free Pads + Kit"],
    time: "Today, 2:00 – 5:00 PM"
  },
  {
    date: "Apr 26", title: "Menstrual Health Workshop",
    venue: "Community Hall, Toranagallu",
    tags: ["Especially for Teens", "Nurse-Led Session"],
    time: "Tomorrow, 11:00 AM – 1:00 PM"
  }
];

export const POLICY_RECOMMENDATIONS = [
  {
    priority: "urgent", district: "Ballari",
    issue: "Anaemia prevalence 58%",
    action: "Deploy iron-supplementation programs in 12 schools",
    impact: "+14% WHI score"
  },
  {
    priority: "moderate", district: "Ballari",
    issue: "Menopause awareness: 5%",
    action: "Health screening + menopause awareness at PHCs",
    impact: "+8% WHI score"
  },
  {
    priority: "urgent", district: "Kalaburagi",
    issue: "Fund utilization: 47%",
    action: "Investigate fund leakage – misuse suspected",
    impact: "₹8 Cr recovery"
  }
];
