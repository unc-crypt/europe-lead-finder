export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  domain: string;
  industry: string;
  companySize: string;
  seniority: string;
  verified: "verified" | "likely" | "unverified";
  linkedIn?: string;
  confidence: number;
}

export const mockLeads: Lead[] = [
  { id: "1", firstName: "Klaus", lastName: "Müller", title: "CTO", company: "TechVentures GmbH", email: "k.mueller@techventures.de", phone: "+49 30 1234567", country: "Germany", domain: "gmx.de", industry: "Technology", companySize: "50-200", seniority: "C-Level", verified: "verified", confidence: 95, linkedIn: "https://linkedin.com/in/klausmueller" },
  { id: "2", firstName: "Marie", lastName: "Dubois", title: "VP Sales", company: "Innovatech SAS", email: "m.dubois@innovatech.fr", phone: "+33 1 23456789", country: "France", domain: "orange.fr", industry: "SaaS", companySize: "200-500", seniority: "VP", verified: "verified", confidence: 92 },
  { id: "3", firstName: "Georgi", lastName: "Petrov", title: "Head of Marketing", company: "Sofia Digital AD", email: "g.petrov@sofiadigital.bg", phone: "+359 2 9876543", country: "Bulgaria", domain: "abv.bg", industry: "Marketing", companySize: "10-50", seniority: "Director", verified: "likely", confidence: 78 },
  { id: "4", firstName: "Marco", lastName: "Rossi", title: "CEO", company: "Rossi Consultants Srl", email: "m.rossi@rossiconsultants.it", phone: "+39 02 7654321", country: "Italy", domain: "libero.it", industry: "Consulting", companySize: "10-50", seniority: "C-Level", verified: "verified", confidence: 98 },
  { id: "5", firstName: "Anna", lastName: "Kowalska", title: "Sales Director", company: "Warsaw Solutions Sp.", email: "a.kowalska@warsawsol.pl", phone: "+48 22 1234567", country: "Poland", domain: "wp.pl", industry: "Technology", companySize: "50-200", seniority: "Director", verified: "verified", confidence: 90 },
  { id: "6", firstName: "Carlos", lastName: "García", title: "Managing Director", company: "Iberia Tech SL", email: "c.garcia@iberiatech.es", phone: "+34 91 2345678", country: "Spain", domain: "terra.es", industry: "FinTech", companySize: "200-500", seniority: "C-Level", verified: "likely", confidence: 75 },
  { id: "7", firstName: "Jan", lastName: "de Vries", title: "Product Manager", company: "Amsterdam AI BV", email: "j.devries@amsterdamai.nl", phone: "+31 20 9876543", country: "Netherlands", domain: "planet.nl", industry: "AI/ML", companySize: "50-200", seniority: "Manager", verified: "verified", confidence: 88 },
  { id: "8", firstName: "Elena", lastName: "Novak", title: "CFO", company: "Prague Fintech s.r.o.", email: "e.novak@praguefintech.cz", phone: "+420 2 12345678", country: "Czech Republic", domain: "seznam.cz", industry: "FinTech", companySize: "10-50", seniority: "C-Level", verified: "unverified", confidence: 62 },
  { id: "9", firstName: "Sofia", lastName: "Andersson", title: "Engineering Lead", company: "Nordic Code AB", email: "s.andersson@nordiccode.se", phone: "+46 8 12345678", country: "Sweden", domain: "telia.com", industry: "Technology", companySize: "200-500", seniority: "Manager", verified: "verified", confidence: 94 },
  { id: "10", firstName: "Alexandru", lastName: "Popescu", title: "VP Engineering", company: "Bucharest Labs SRL", email: "a.popescu@bucharestlabs.ro", phone: "+40 21 1234567", country: "Romania", domain: "yahoo.ro", industry: "SaaS", companySize: "50-200", seniority: "VP", verified: "likely", confidence: 80 },
  { id: "11", firstName: "Yuki", lastName: "Tanaka", title: "Business Development", company: "Tokyo Growth KK", email: "y.tanaka@tokyogrowth.jp", phone: "+81 3 12345678", country: "Japan", domain: "docomo.ne.jp", industry: "Technology", companySize: "500+", seniority: "Manager", verified: "verified", confidence: 91 },
  { id: "12", firstName: "Ricardo", lastName: "Silva", title: "Marketing Director", company: "São Paulo Digital", email: "r.silva@spdigital.com.br", phone: "+55 11 98765432", country: "Brazil", domain: "uol.com.br", industry: "Marketing", companySize: "200-500", seniority: "Director", verified: "likely", confidence: 73 },
];

export const countries = [
  "All Countries",
  // Europe (primary focus)
  "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
  "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
  "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
  "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine",
  "United Kingdom",
  // Asia
  "China", "Hong Kong", "India", "Indonesia", "Japan", "Malaysia",
  "Philippines", "Singapore", "South Korea", "Taiwan", "Thailand", "Vietnam",
  // Americas
  "Argentina", "Brazil", "Canada", "Chile", "Colombia", "Mexico", "United States",
  // Africa
  "Egypt", "Kenya", "Morocco", "Nigeria", "South Africa",
  // Oceania
  "Australia", "New Zealand",
];

export const europeanCountries = [
  "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
  "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
  "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
  "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
  "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
  "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Ukraine",
  "United Kingdom",
];

export const industries = [
  "All Industries", "Technology", "SaaS", "FinTech", "Marketing", "Consulting",
  "AI/ML", "Healthcare", "E-commerce", "Manufacturing", "Education",
  "Legal", "Real Estate", "Insurance", "Banking", "Telecommunications",
  "Automotive", "Energy", "Pharmaceuticals", "Media & Entertainment",
  "Logistics & Transportation", "Agriculture", "Construction", "Retail",
  "Government", "Non-Profit",
];

export const companySizes = ["All Sizes", "1-10", "10-50", "50-200", "200-500", "500-1000", "1000-5000", "5000-10000", "10000+"];
export const seniorityLevels = ["All Levels", "C-Level", "VP", "Director", "Manager", "Senior", "Individual Contributor", "Intern"];

export const europeanDomains = [
  // Western Europe
  { country: "Germany", domains: ["gmx.de", "web.de", "t-online.de", "freenet.de"] },
  { country: "France", domains: ["orange.fr", "wanadoo.fr", "free.fr", "sfr.fr", "laposte.net"] },
  { country: "United Kingdom", domains: ["btinternet.com", "sky.com", "virginmedia.com", "talktalk.net"] },
  { country: "Italy", domains: ["libero.it", "virgilio.it", "tiscali.it", "alice.it", "tin.it"] },
  { country: "Spain", domains: ["terra.es", "ya.com", "telefonica.net", "movistar.es"] },
  { country: "Netherlands", domains: ["planet.nl", "kpnmail.nl", "ziggo.nl", "xs4all.nl"] },
  { country: "Belgium", domains: ["skynet.be", "telenet.be", "proximus.be"] },
  { country: "Switzerland", domains: ["bluewin.ch", "sunrise.ch", "gmx.ch"] },
  { country: "Austria", domains: ["gmx.at", "aon.at", "a1.net", "chello.at"] },
  { country: "Luxembourg", domains: ["pt.lu", "vo.lu"] },
  // Northern Europe
  { country: "Sweden", domains: ["telia.com", "comhem.se", "bredbandsbolaget.se"] },
  { country: "Denmark", domains: ["tdcadsl.dk", "jubii.dk", "stofanet.dk"] },
  { country: "Norway", domains: ["online.no", "broadpark.no", "telenor.com"] },
  { country: "Finland", domains: ["kolumbus.fi", "welho.com", "elisanet.fi"] },
  { country: "Iceland", domains: ["simnet.is", "internet.is"] },
  // Eastern Europe
  { country: "Poland", domains: ["wp.pl", "o2.pl", "interia.pl", "onet.pl", "poczta.fm"] },
  { country: "Czech Republic", domains: ["seznam.cz", "centrum.cz", "volny.cz", "atlas.cz"] },
  { country: "Romania", domains: ["yahoo.ro", "rdslink.ro", "clicknet.ro"] },
  { country: "Hungary", domains: ["freemail.hu", "citromail.hu", "t-online.hu"] },
  { country: "Bulgaria", domains: ["abv.bg", "mail.bg", "gbg.bg", "dir.bg"] },
  { country: "Slovakia", domains: ["centrum.sk", "azet.sk", "post.sk"] },
  { country: "Slovenia", domains: ["siol.net", "volja.net", "t-2.net"] },
  { country: "Croatia", domains: ["net.hr", "optinet.hr", "iskon.hr"] },
  { country: "Serbia", domains: ["eunet.rs", "sbb.rs", "open.telekom.rs"] },
  { country: "Ukraine", domains: ["ukr.net", "meta.ua", "i.ua", "bigmir.net"] },
  { country: "Russia", domains: ["mail.ru", "yandex.ru", "rambler.ru", "list.ru"] },
  { country: "Lithuania", domains: ["takas.lt", "delfi.lt", "inbox.lt"] },
  { country: "Latvia", domains: ["inbox.lv", "one.lv", "apollo.lv"] },
  { country: "Estonia", domains: ["hot.ee", "mail.ee", "neti.ee"] },
  { country: "Belarus", domains: ["tut.by", "mail.by"] },
  { country: "Moldova", domains: ["mail.md", "starnet.md"] },
  // Southern Europe
  { country: "Portugal", domains: ["sapo.pt", "clix.pt", "iol.pt", "netcabo.pt"] },
  { country: "Greece", domains: ["otenet.gr", "forthnet.gr", "in.gr", "hol.gr"] },
  { country: "Turkey", domains: ["mynet.com", "superonline.com", "ttnet.net.tr", "turk.net"] },
  { country: "Cyprus", domains: ["cytanet.com.cy", "logos.cy.net"] },
  { country: "Malta", domains: ["onvol.net", "maltanet.net"] },
];
