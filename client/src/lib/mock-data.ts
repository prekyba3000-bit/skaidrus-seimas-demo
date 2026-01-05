export const mockMp = {
  id: 1,
  name: "Ingrida Šimonytė",
  party: "Tėvynės sąjunga-Lietuvos krikščionys demokratai",
  faction: "TS-LKD frakcija",
  district: "Antakalnio",
  districtNumber: 3,
  email: "ingrida.simonyte@lrs.lt",
  phone: "(8 5) 239 6600",
  photoUrl:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Ingrida_%C5%A0imonyt%C4%9B_2019.jpg/800px-Ingrida_%C5%A0imonyt%C4%9B_2019.jpg",
  biography:
    "Ingrida Šimonytė (g. 1974 m. lapkričio 15 d. Vilniuje) – Lietuvos politikė, ekonomistė, 2020–2024 m. Lietuvos Respublikos Ministrė Pirmininkė. 2009–2012 m. finansų ministrė. 2013–2016 m. Lietuvos banko valdybos pirmininko pavaduotoja. Nuo 2016 m. Seimo narė.",
  isActive: true,
};

export const mockStats = {
  mpId: 1,
  votingAttendance: "94.5",
  partyLoyalty: "98.2",
  billsProposed: 42,
  billsPassed: 36,
  accountabilityScore: "96.8",
  lastCalculated: new Date().toISOString(),
};

export const mockVotes = [
  {
    id: 101,
    billId: 5023,
    voteValue: "for",
    votedAt: "2025-12-15T10:30:00Z",
    billTitle: "Dėl Biudžeto sandaros įstatymo pakeitimo",
  },
  {
    id: 102,
    billId: 5024,
    voteValue: "for",
    votedAt: "2025-12-15T11:15:00Z",
    billTitle: "Dėl Pridėtinės vertės mokesčio įstatymo pakeitimo",
  },
  {
    id: 103,
    billId: 5025,
    voteValue: "against",
    votedAt: "2025-12-14T14:20:00Z",
    billTitle: "Dėl Azartinių lošimų įstatymo pakeitimo",
  },
  {
    id: 104,
    billId: 5026,
    voteValue: "abstain",
    votedAt: "2025-12-14T15:45:00Z",
    billTitle: "Dėl Vietos savivaldos įstatymo pakeitimo",
  },
  {
    id: 105,
    billId: 5027,
    voteValue: "for",
    votedAt: "2025-12-10T09:00:00Z",
    billTitle: "Dėl Švietimo įstatymo pakeitimo",
  },
];

// Generate more mock votes to fill the chart
for (let i = 0; i < 45; i++) {
  const values = ["for", "for", "for", "against", "abstain", "absent"];
  const randomValue = values[Math.floor(Math.random() * values.length)];
  mockVotes.push({
    id: 200 + i,
    billId: 6000 + i,
    voteValue: randomValue,
    votedAt: new Date(Date.now() - i * 86400000).toISOString(),
    billTitle: `Įstatymo projektas Nr. ${6000 + i}`,
  });
}
