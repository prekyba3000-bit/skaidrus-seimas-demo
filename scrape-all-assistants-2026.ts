import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

// List of all current MPs with their IDs (extracted from https://www.lrs.lt/sip/portal.show?p_r=35299&p_k=1)
const currentMPs = [
    { name: 'Alekna Virgilijus', id: '79162' },
    { name: 'Aleknavičienė Vaida', id: '90939' },
    { name: 'Anušauskas Arvydas', id: '53916' },
    { name: 'Asadauskaitė-Zadneprovskienė Laura', id: '90925' },
    { name: 'Asanavičiūtė-Gružauskienė Dalia', id: '84599' },
    { name: 'Ažubalis Audronius', id: '7208' },
    { name: 'Ąžuolas Valius', id: '79165' },
    { name: 'Bagdonas Andrius', id: '84600' },
    { name: 'Balčytis Zigmantas', id: '47220' },
    { name: 'Balčytytė Giedrė', id: '90940' },
    { name: 'Balsys Linas', id: '73568' },
    { name: 'Baranovas Ruslanas', id: '84705' },
    { name: 'Barauskas Tadas', id: '73848' },
    { name: 'Baškienė Rima', id: '26656' },
    { name: 'Bilius Kęstutis', id: '84854' },
    { name: 'Bilotaitė Agnė', id: '50482' },
    { name: 'Birutis Šarūnas', id: '73569' },
    { name: 'Bradauskas Dainoras', id: '90941' },
    { name: 'Braziulienė Ingrida', id: '90942' },
    { name: 'Bucevičius Saulius', id: '47856' },
    { name: 'Budbergytė Rasa', id: '7363' },
    { name: 'Busila Andrius', id: '90943' },
    { name: 'Butkevičius Algirdas', id: '7194' },
    { name: 'Čaplinskas Saulius', id: '90944' },
    { name: 'Čmilytė-Nielsen Viktorija', id: '71563' },
    { name: 'Dargis Petras', id: '90920' },
    { name: 'Domarkas Tomas', id: '90945' },
    { name: 'Drukteinis Giedrius', id: '90946' },
    { name: 'Dudėnas Arūnas', id: '50877' },
    { name: 'Fiodorovas Viktoras', id: '73571' },
    { name: 'Gailius Vitalijus', id: '73572' },
    { name: 'Gaižauskas Dainius', id: '79169' },
    { name: 'Gedvilas Aidas', id: '47855' },
    { name: 'Gedvilas Martynas', id: '90947' },
    { name: 'Gedvilienė Aistė', id: '73917' },
    { name: 'Gelažnikienė Ilona', id: '90948' },
    { name: 'Gentvilas Eugenijus', id: '146' },
    { name: 'Gentvilas Simonas', id: '79170' },
    { name: 'Girskienė Ligita', id: '79353' },
    { name: 'Griškevičius Domas', id: '84604' },
    { name: 'Grubliauskas Vytautas', id: '34428' },
    { name: 'Jakavičius Darius', id: '90949' },
    { name: 'Jakavičiutė-Miliauskienė Agnė', id: '90950' },
    { name: 'Jankūnas Rimas Jonas', id: '90970' },
    { name: 'Janušonienė Roma', id: '90951' },
    { name: 'Jeglinskas Giedrimas', id: '90926' },
    { name: 'Jonauskas Linas', id: '47571' },
    { name: 'Jucius Vytautas', id: '79343' },
    { name: 'Juozapaitis Vytautas', id: '73575' },
    { name: 'Juška Ričardas', id: '35799' },
    { name: 'Kairys Simonas', id: '90922' },
    { name: 'Kasčiūnas Laurynas', id: '64701' },
    { name: 'Katelynas Martynas', id: '83412' },
    { name: 'Kaunas Robertas', id: '90952' },
    { name: 'Kazlavickas Liutauras', id: '54711' },
    { name: 'Kernagis Vytautas', id: '79176' },
    { name: 'Kirkutis Eimantas', id: '90923' },
    { name: 'Kižienė Indrė', id: '73694' },
    { name: 'Kreivys Dainius', id: '24048' },
    { name: 'Kukuraitis Linas', id: '84606' },
    { name: 'Kuodis Raimondas', id: '16004' },
    { name: 'Kuzmickienė Paulė', id: '69153' },
    { name: 'Leiputė Orinta', id: '15266' },
    { name: 'Lydeka Arminas', id: '47211' },
    { name: 'Lingė Mindaugas', id: '84607' },
    { name: 'Luščikas Saulius', id: '90931' },
    { name: 'Maldeikis Matas', id: '69276' },
    { name: 'Martinaitis Tomas', id: '90924' },
    { name: 'Mažeika Kęstutis', id: '79131' },
    { name: 'Miliūtė Rūta', id: '79132' },
    { name: 'Mockus Alvydas', id: '90932' },
    { name: 'Morkūnaitė-Mikulėnienė Radvilė', id: '48538' },
    { name: 'Motuzas Remigijus', id: '7597' },
    { name: 'Narkevič Jaroslav', id: '12253' },
    { name: 'Nedzinskas Antanas', id: '53911' },
    { name: 'Neimantas Karolis', id: '90933' },
    { name: 'Norkienė Aušrinė', id: '79136' },
    { name: 'Olekas Juozas', id: '7193' },
    { name: 'Olševski Česlav', id: '79137' },
    { name: 'Paluckas Gintautas', id: '84612' },
    { name: 'Pavilionis Žygimantas', id: '79139' },
    { name: 'Petkevičienė Daiva', id: '90934' },
    { name: 'Petrauskaitė Modesta', id: '73642' },
    { name: 'Petrošius Audrius', id: '84614' },
    { name: 'Pocius Arvydas', id: '83614' },
    { name: 'Podolskis Karolis', id: '70414' },
    { name: 'Popovienė Raminta', id: '73583' },
    { name: 'Poškus Mantas', id: '77490' },
    { name: 'Prajara Tadas', id: '90935' },
    { name: 'Pranckietis Viktoras', id: '79141' },
    { name: 'Puchovič Robert', id: '90927' },
    { name: 'Radvila Algimantas', id: '90936' },
    { name: 'Radvilavičius Audrius', id: '90937' },
    { name: 'Rakutis Valdas', id: '84616' },
    { name: 'Razma Jurgis', id: '7242' },
    { name: 'Razmislevičius Darius', id: '90938' },
    { name: 'Rojaka Jekaterina', id: '90627' },
    { name: 'Ropė Bronis', id: '23279' },
    { name: 'Rudelienė Edita', id: '86469' },
    { name: 'Ruginienė Inga', id: '90953' },
    { name: 'Sabatauskas Julius', id: '23521' },
    { name: 'Sabutis Eugenijus', id: '84618' },
    { name: 'Sadauskis Tadas', id: '83286' },
    { name: 'Savickas Lukas', id: '84619' },
    { name: 'Sejonienė Jurgita', id: '84620' },
    { name: 'Sinica Vytautas', id: '74854' },
    { name: 'Sinkevičius Rimantas', id: '26333' },
    { name: 'Sysas Algirdas', id: '7252' },
    { name: 'Skaistė Gintarė', id: '71923' },
    { name: 'Skamarakas Matas', id: '89374' },
    { name: 'Skardžius Artūras', id: '47229' },
    { name: 'Skvernelis Saulius', id: '79145' },
    { name: 'Starkevičius Kazys', id: '47839' },
    { name: 'Šakalienė Dovilė', id: '79150' },
    { name: 'Šedvydis Laurynas', id: '79225' },
    { name: 'Šeršniovas Vitalijus', id: '90913' },
    { name: 'Šimonytė Ingrida', id: '56180' },
    { name: 'Širinskienė Agnė', id: '79153' },
    { name: 'Šukevičienė Jurgita', id: '79122' },
    { name: 'Šukevičius Šarūnas', id: '90914' },
    { name: 'Šukys Raimondas', id: '23671' },
    { name: 'Šukytė-Korsakė Lina', id: '90928' },
    { name: 'Šuklin Jevgenij', id: '90915' },
    { name: 'Tamašunienė Rita', id: '73586' },
    { name: 'Tomilinas Tomas', id: '48049' },
    { name: 'Turauskaitė Violeta', id: '90916' },
    { name: 'Ulbinaitė Daiva', id: '90917' },
    { name: 'Urmanavičius Linas', id: '90918' },
    { name: 'Vaitiekūnienė Lilija', id: '90929' },
    { name: 'Valinskas Arūnas', id: '81543' },
    { name: 'Varnas Dainius', id: '90919' },
    { name: 'Vėgėlė Ignas', id: '90930' },
    { name: 'Vėsaitė Birutė', id: '23526' },
    { name: 'Vilkauskas Kęstutis', id: '22886' },
    { name: 'Visockas Paulius', id: '90971' },
    { name: 'Vyžintas Ramūnas', id: '90921' },
    { name: 'Zailskienė Jūratė', id: '29725' },
    { name: 'Zingeris Emanuelis', id: '43' },
    { name: 'Zuokas Artūras', id: '47857' },
    { name: 'Žebelienė Daiva', id: '70739' },
    { name: 'Žemaitaitis Remigijus', id: '65703' },
];

interface Assistant {
    mpName: string;
    mpId: string;
    name: string;
    role: string;
    phone: string;
    email: string;
}

async function scrapeAssistantsForMP(mp: { name: string; id: string }): Promise<Assistant[]> {
    const url = `https://www.lrs.lt/sip/portal.show?p_r=35381&p_k=1&p_a=31&p_asm_id=${mp.id}`;

    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const assistants: Assistant[] = [];

        // Find the table with assistants
        $('table tr').each((index, row) => {
            if (index === 0) return; // Skip header row

            const cells = $(row).find('td');
            if (cells.length >= 4) {
                assistants.push({
                    mpName: mp.name,
                    mpId: mp.id,
                    name: $(cells[0]).text().trim(),
                    role: $(cells[1]).text().trim(),
                    phone: $(cells[2]).text().trim(),
                    email: $(cells[3]).text().trim(),
                });
            }
        });

        return assistants;
    } catch (error) {
        console.error(`Error scraping ${mp.name}:`, error);
        return [];
    }
}

async function main() {
    console.log(`Starting to scrape assistants for ${currentMPs.length} MPs...`);

    const allAssistants: Assistant[] = [];

    for (let i = 0; i < currentMPs.length; i++) {
        const mp = currentMPs[i];
        console.log(`[${i + 1}/${currentMPs.length}] Scraping ${mp.name}...`);

        const assistants = await scrapeAssistantsForMP(mp);
        allAssistants.push(...assistants);

        // Rate limiting - wait 500ms between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\nTotal assistants scraped: ${allAssistants.length}`);

    // Save to JSON
    fs.writeFileSync(
        'assistants_2026.json',
        JSON.stringify(allAssistants, null, 2),
        'utf-8'
    );

    console.log('Saved to assistants_2026.json');

    // Generate summary
    console.log('\n=== Summary ===');
    console.log(`Total MPs: ${currentMPs.length}`);
    console.log(`Total Assistants: ${allAssistants.length}`);
    console.log(`Average assistants per MP: ${(allAssistants.length / currentMPs.length).toFixed(2)}`);
}

main().catch(console.error);
