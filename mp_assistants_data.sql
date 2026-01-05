-- MP Assistants Data Import (Generated from live site on 2026-01-05)
-- This script matches MP names to IDs and inserts their assistants
-- Names converted to "FirstName LastName" format to match database
-- Total MPs: 141
-- Total Assistants: 538

DO $$
BEGIN

-- Agnė Bilotaitė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ginta ANDRIJAUSKIENĖ', 'Patarėja', '(0 5) 209 6629', '[email protected]' FROM mps WHERE name = 'Agnė Bilotaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė GRAJAUSKIENĖ', 'Patarėja', '(0 5) 209 6629', '[email protected]' FROM mps WHERE name = 'Agnė Bilotaitė';

-- Agnė Jakavičiutė-Miliauskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vida BALTOKĖ', 'Patarėja', '(0 5) 209 6623', '[email protected]' FROM mps WHERE name = 'Agnė Jakavičiutė-Miliauskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aldona KRISIUKĖNIENĖ', 'Patarėja', '(0 5) 209 6623', '' FROM mps WHERE name = 'Agnė Jakavičiutė-Miliauskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Giedrius PRANCKUS (apygardoje)', 'Patarėjas', '(0 5) 209 6623', '[email protected]' FROM mps WHERE name = 'Agnė Jakavičiutė-Miliauskienė';

-- Agnė Širinskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janina BALSIENĖ', 'Patarėja', '(0 5) 209 6683', '[email protected]' FROM mps WHERE name = 'Agnė Širinskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aldona Violeta GRINIENĖ', 'Patarėja', '(0 5) 209 6683', '[email protected]' FROM mps WHERE name = 'Agnė Širinskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Deimantė PETRAUSKAITĖ', 'Patarėja', '(0 5) 209 6683', '[email protected]' FROM mps WHERE name = 'Agnė Širinskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė STONIENĖ', 'Patarėja', '(0 5) 209 6683', '[email protected]' FROM mps WHERE name = 'Agnė Širinskienė';

-- Aidas Gedvilas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aurelija ČIŽAUSKAITĖ-BUTKALIUK', 'Patarėja', '(0 5) 209 6617', '[email protected]' FROM mps WHERE name = 'Aidas Gedvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marina ISRAJELIAN', 'Patarėja', '(0 5) 209 6617', '' FROM mps WHERE name = 'Aidas Gedvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danguolė MARTINKIENĖ', 'Patarėja', '(0 5) 209 6617', '' FROM mps WHERE name = 'Aidas Gedvilas';

-- Aistė Gedvilienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Agnė ANDREIKĖNIENĖ', 'Patarėja', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jūratė GARLIAUSKIENĖ', 'Patarėja', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Asta KAŠĖTIENĖ', 'Patarėja', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Erika KIŽIENĖ', 'Patarėja', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Regina LUKOŠEVIČIENĖ', 'Patarėja', '(0 5) 209 6658', '[email protected]' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gitana MATIEKUVIENĖ', 'Patarėja', '(0 5) 209 6658', '[email protected]' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edgaras MURNIKOVAS', 'Patarėjas', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra URBONIENĖ', 'Patarėja', '(0 5) 209 6658', '' FROM mps WHERE name = 'Aistė Gedvilienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Birutė VIJEIKIENĖ', 'Patarėja', '(0 5) 209 6658', '[email protected]' FROM mps WHERE name = 'Aistė Gedvilienė';

-- Algimantas Radvila
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramunė DAŠKEVIČIENĖ', 'Patarėja', '(0 5) 209 6641', '[email protected]' FROM mps WHERE name = 'Algimantas Radvila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jovita MARDOSIENĖ', 'Patarėja', '(0 5) 209 6641', '[email protected]' FROM mps WHERE name = 'Algimantas Radvila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rita OŽELĖ', 'Patarėja', '(0 5) 209 6641', '[email protected]' FROM mps WHERE name = 'Algimantas Radvila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Elita PLERPIENĖ', 'Patarėja', '(0 5) 209 6641', '[email protected]' FROM mps WHERE name = 'Algimantas Radvila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Adomas VAICEKAUSKAS', 'Patarėjas', '(0 5) 209 6641', '[email protected]' FROM mps WHERE name = 'Algimantas Radvila';

-- Algirdas Butkevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alina BRAZDILIENĖ', 'Patarėja', '(0 5) 209 6920', '[email protected]' FROM mps WHERE name = 'Algirdas Butkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Viktorija DULSKYTĖ', 'Patarėja', '(0 5) 209 6920', '[email protected]' FROM mps WHERE name = 'Algirdas Butkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas KANTAUTAS (apygardoje)', 'Patarėjas', '(0 5) 209 6920', '[email protected]' FROM mps WHERE name = 'Algirdas Butkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gustė PUŽAITĖ (apygardoje)', 'Patarėja', '(0 5) 209 6920', '[email protected]' FROM mps WHERE name = 'Algirdas Butkevičius';

-- Algirdas Sysas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Angelė ČEPONKIENĖ', 'Patarėja', '(0 5) 209 6702', '' FROM mps WHERE name = 'Algirdas Sysas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Justina GLIEBUTĖ-GIMŽAUSKIENĖ', 'Patarėja', '(0 5) 209 6702', '[email protected]' FROM mps WHERE name = 'Algirdas Sysas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Oleg KORSAK', 'Patarėjas', '(0 5) 209 6702', '' FROM mps WHERE name = 'Algirdas Sysas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gerardas STONKUS', 'Patarėjas', '(0 5) 209 6702', '' FROM mps WHERE name = 'Algirdas Sysas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Morta VIDŪNAITĖ', 'Patarėja', '(0 5) 209 6702', '[email protected]' FROM mps WHERE name = 'Algirdas Sysas';

-- Alvydas Mockus
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidotas JASAS', 'Patarėjas', '(0 5) 209 6624', '[email protected]' FROM mps WHERE name = 'Alvydas Mockus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaida RAČKAUSKIENĖ', 'Padėjėja', '(0 5) 209 6624', '[email protected]' FROM mps WHERE name = 'Alvydas Mockus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė RANCIENĖ', 'Padėjėja', '(0 5) 209 6624', '[email protected]' FROM mps WHERE name = 'Alvydas Mockus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita RUDIENĖ', 'Padėjėja', '(0 5) 209 6624', '[email protected]' FROM mps WHERE name = 'Alvydas Mockus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julija SKIOTYTĖ', 'Padėjėja', '(0 5) 209 6624', '' FROM mps WHERE name = 'Alvydas Mockus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantas VIRBAUSKAS', 'Padėjėjas', '(0 5) 209 6624', '[email protected]' FROM mps WHERE name = 'Alvydas Mockus';

-- Andrius Bagdonas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Asta BIELINSKIENĖ', 'Patarėja', '(0 5) 209 6646', '[email protected]' FROM mps WHERE name = 'Andrius Bagdonas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Agnė JENČAUSKIENĖ', 'Padėjėja, Patarėja', '(0 5) 209 6646', '[email protected]' FROM mps WHERE name = 'Andrius Bagdonas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Reda KNEIZEVIČIENĖ', 'Padėjėja', '(0 5) 209 6646', '[email protected]' FROM mps WHERE name = 'Andrius Bagdonas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė MARTIKONYTĖ', 'Padėjėja', '(0 5) 209 6646', '[email protected]' FROM mps WHERE name = 'Andrius Bagdonas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marcijonas URMONAS', 'Patarėjas', '(0 5) 209 6646', '' FROM mps WHERE name = 'Andrius Bagdonas';

-- Andrius Busila
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ingrida MAZALIAUSKIENĖ', 'Padėjėja', '0 611 07749', '[email protected]' FROM mps WHERE name = 'Andrius Busila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantas NAVARUCKIS', 'Patarėjas', '(0 5) 209 6653', '[email protected]' FROM mps WHERE name = 'Andrius Busila';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danutė STANEVIČIENĖ', 'Padėjėja', '0 611 07749', '' FROM mps WHERE name = 'Andrius Busila';

-- Antanas Nedzinskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimantas BARAVYKAS', 'Patarėjas', '(0 5) 209 6737', '' FROM mps WHERE name = 'Antanas Nedzinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Auksė PETRUŠKEVIČIŪTĖ', 'Patarėja', '(0 5) 209 6737', '[email protected]' FROM mps WHERE name = 'Antanas Nedzinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra VAITKŪNIENĖ', 'Patarėja', '(0 5) 209 6737', '' FROM mps WHERE name = 'Antanas Nedzinskas';

-- Arminas Lydeka
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolita BAUŠYTĖ', 'Patarėja', '(0 5) 209 6725', '[email protected]' FROM mps WHERE name = 'Arminas Lydeka';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Donatas MARKAUSKAS', 'Padėjėjas, Patarėjas', '(0 5) 209 6725', '[email protected]' FROM mps WHERE name = 'Arminas Lydeka';

-- Artūras Skardžius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raimonda ALIJOŠIENĖ', 'Patarėja', '(0 5) 209 6441', '[email protected]' FROM mps WHERE name = 'Artūras Skardžius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kastytis BRAZIULIS', 'Patarėjas', '(0 5) 209 6441', '[email protected]' FROM mps WHERE name = 'Artūras Skardžius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simas GRAUŽYS (apygardoje)', 'Patarėjas', '(0 5) 209 6441', '[email protected]' FROM mps WHERE name = 'Artūras Skardžius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Agnė MILKUVIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6441', '[email protected]' FROM mps WHERE name = 'Artūras Skardžius';

-- Artūras Zuokas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta BUTKEVIČIENĖ', 'Patarėja', '(0 5) 209 6680', '' FROM mps WHERE name = 'Artūras Zuokas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Birutė RIMŠAITĖ VARNIENĖ', 'Patarėja', '(0 5) 209 6680', '[email protected]' FROM mps WHERE name = 'Artūras Zuokas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rolandas VAIŠKŪNAS', 'Patarėjas', '(0 5) 209 6680', '[email protected]' FROM mps WHERE name = 'Artūras Zuokas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Leda ŽILINSKIENĖ', 'Patarėja', '(0 5) 209 6680', '[email protected]' FROM mps WHERE name = 'Artūras Zuokas';

-- Arvydas Anušauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė BENDOKIENĖ', 'Patarėja', '(0 5) 209 6878', '[email protected]' FROM mps WHERE name = 'Arvydas Anušauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė KAMINSKIENĖ', 'Patarėja', '(0 5) 209 6878', '[email protected]' FROM mps WHERE name = 'Arvydas Anušauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Greta LABENSKAITĖ', 'Patarėja', '(0 5) 209 6878', '[email protected]' FROM mps WHERE name = 'Arvydas Anušauskas';

-- Arvydas Pocius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jonas GUDAUSKAS', 'Padėjėjas', '(0 5) 209 6685', '[email protected]' FROM mps WHERE name = 'Arvydas Pocius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gytis JANIŠIUS', 'Padėjėjas, Patarėjas', '0 620 90336', '[email protected]' FROM mps WHERE name = 'Arvydas Pocius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Leonas STONKUS', 'Padėjėjas', '(0 5) 209 6685', '[email protected]' FROM mps WHERE name = 'Arvydas Pocius';

-- Arūnas Dudėnas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Juozas JUKNIUS', 'Patarėjas', '(0 5) 209 6655', '[email protected]' FROM mps WHERE name = 'Arūnas Dudėnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marijona LUKAŠEVIČIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6655', '[email protected]' FROM mps WHERE name = 'Arūnas Dudėnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta RIMKEVIČĖ (apygardoje)', 'Patarėja', '(0 5) 209 6655', '' FROM mps WHERE name = 'Arūnas Dudėnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Toma SONGAILIENĖ', 'Patarėja', '(0 5) 209 6655', '[email protected]' FROM mps WHERE name = 'Arūnas Dudėnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danguolė VASILIAUSKIENĖ', 'Patarėja', '(0 5) 209 6655', '' FROM mps WHERE name = 'Arūnas Dudėnas';

-- Arūnas Valinskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Andrius NAVICKAS', 'Patarėjas', '(0 5) 209 6916', '[email protected]' FROM mps WHERE name = 'Arūnas Valinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gražina SERMONTĖ', 'Patarėja', '(0 5) 209 6916', '[email protected]' FROM mps WHERE name = 'Arūnas Valinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina ŠLIAŽAITĖ', 'Patarėja', '(0 5) 209 6916', '[email protected]' FROM mps WHERE name = 'Arūnas Valinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas ŠUNOKAS', 'Patarėjas', '(0 5) 209 6916', '' FROM mps WHERE name = 'Arūnas Valinskas';

-- Audrius Petrošius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Andrius DOBRANSKIS', 'Patarėjas', '(0 5) 209 6628', '' FROM mps WHERE name = 'Audrius Petrošius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alvidas ŠIMKUS (apygardoje)', 'Patarėjas', '(0 5) 209 6628', '' FROM mps WHERE name = 'Audrius Petrošius';

-- Audrius Radvilavičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rytis MAROZAS', 'Patarėjas', '(0 5) 209 6694', '[email protected]' FROM mps WHERE name = 'Audrius Radvilavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Neringa PAVILONYTĖ', 'Patarėja', '(0 5) 209 6694', '[email protected]' FROM mps WHERE name = 'Audrius Radvilavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Robertas STANIONIS', 'Patarėjas', '(0 5) 209 6694', '[email protected]' FROM mps WHERE name = 'Audrius Radvilavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mavliuda ŠTRUPKIENĖ', 'Patarėja', '(0 5) 209 6694', '[email protected]' FROM mps WHERE name = 'Audrius Radvilavičius';

-- Audronius Ažubalis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Margarita BUTKIENĖ', 'Padėjėja', '(0 5) 209 6321', '[email protected]' FROM mps WHERE name = 'Audronius Ažubalis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lukas KRIŠČIŪNAS', 'Padėjėjas, Patarėjas', '(0 5) 209 6321', '[email protected]' FROM mps WHERE name = 'Audronius Ažubalis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė MINSEVIČIŪTĖ-BALYNIENĖ', 'Padėjėja', '(0 5) 209 6321', '[email protected]' FROM mps WHERE name = 'Audronius Ažubalis';

-- Aušrinė Norkienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilma AASRUM', 'Patarėja', '(0 5) 209 6956', '[email protected]' FROM mps WHERE name = 'Aušrinė Norkienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramūnas AUŠROTAS', 'Patarėjas', '(0 5) 209 6956', '[email protected]' FROM mps WHERE name = 'Aušrinė Norkienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė JANKUVIENĖ', 'Patarėja', '(0 5) 209 6956', '[email protected]' FROM mps WHERE name = 'Aušrinė Norkienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra KULIKAUSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6956', '[email protected]' FROM mps WHERE name = 'Aušrinė Norkienė';

-- Birutė Vėsaitė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Roberta AŽUKAITĖ', 'Patarėja', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Esmeralda KULIEŠYTĖ', 'Patarėja', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas LASAVIČIUS', 'Patarėjas', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Donatas LATKAUSKAS', 'Patarėjas', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Neringa PAVILONYTĖ', 'Patarėja', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Robertas STANIONIS', 'Patarėjas', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mavliuda ŠTRUPKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6709', '[email protected]' FROM mps WHERE name = 'Birutė Vėsaitė';

-- Bronis Ropė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta BIČIUVIENĖ', 'Patarėja', '(0 5) 209 6615', '[email protected]' FROM mps WHERE name = 'Bronis Ropė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintautas KINDURYS', 'Patarėjas', '0 668 42147 (0 5) 209 6615', '[email protected]' FROM mps WHERE name = 'Bronis Ropė';

-- Dainius Gaižauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alma DŽERMEIKIENĖ', 'Padėjėja', '(0 5) 209 6620', '[email protected]' FROM mps WHERE name = 'Dainius Gaižauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Erika NAIKELIENĖ', 'Patarėja', '(0 5) 209 6620', '[email protected]' FROM mps WHERE name = 'Dainius Gaižauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Monika ŠIAUDINYTĖ', 'Patarėja', '(0 5) 209 6773', '[email protected]' FROM mps WHERE name = 'Dainius Gaižauskas';

-- Dainius Kreivys
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta BIZAITĖ', 'Patarėja', '(0 5) 209 6605', '[email protected]' FROM mps WHERE name = 'Dainius Kreivys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laurynas KAMINSKAS', 'Patarėjas', '(0 5) 209 6605', '' FROM mps WHERE name = 'Dainius Kreivys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laima SINKEVIČIENĖ', 'Patarėja', '(0 5) 209 6605', '[email protected]' FROM mps WHERE name = 'Dainius Kreivys';

-- Dainius Varnas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rasa IVANAUSKIENĖ', 'Patarėja', '(0 5) 209 6665', '[email protected]' FROM mps WHERE name = 'Dainius Varnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramūnas KAZAKEVIČIUS', 'Patarėjas', '(0 5) 209 6665', '[email protected]' FROM mps WHERE name = 'Dainius Varnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kastytis MASALSKAS', 'Patarėjas', '(0 5) 209 6665', '[email protected]' FROM mps WHERE name = 'Dainius Varnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta ZABIELIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6665', '[email protected]' FROM mps WHERE name = 'Dainius Varnas';

-- Dainoras Bradauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sofija MAŽUTYTĖ-JUŠKIENĖ', 'Patarėja', '(0 5) 209 6281', '[email protected]' FROM mps WHERE name = 'Dainoras Bradauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Svetlana MELEŠKO', 'Patarėja', '(0 5) 209 6868', '[email protected]' FROM mps WHERE name = 'Dainoras Bradauskas';

-- Daiva Petkevičienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edita KARČIAUSKIENĖ', 'Patarėja', '(0 5) 209 6689', '[email protected]' FROM mps WHERE name = 'Daiva Petkevičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta ŠOSTAUSKIENĖ', 'Patarėja', '(0 5) 209 6689', '[email protected]' FROM mps WHERE name = 'Daiva Petkevičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rolandas VENCKUS', 'Patarėjas', '(0 5) 209 6689', '' FROM mps WHERE name = 'Daiva Petkevičienė';

-- Daiva Ulbinaitė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Indrė MIKELIONYTĖ-PRANCULEVIČIENĖ', 'Patarėja', '(0 5) 209 6682', '[email protected]' FROM mps WHERE name = 'Daiva Ulbinaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Paulius LABANAUSKAS', 'Patarėjas (teisės klausimais)', '(0 5) 209 6682', '[email protected]' FROM mps WHERE name = 'Daiva Ulbinaitė';

-- Daiva Žebelienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aurelija JAKŠTAITĖ', 'Patarėja', '(0 5) 209 6692', '[email protected]' FROM mps WHERE name = 'Daiva Žebelienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edvardas JURJONAS', 'Patarėjas', '(0 5) 209 6692', '[email protected]' FROM mps WHERE name = 'Daiva Žebelienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė PAULAUSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6692', '[email protected]' FROM mps WHERE name = 'Daiva Žebelienė';

-- Dalia Asanavičiūtė-Gružauskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Elena NARKEVIČIŪTĖ', 'Padėjėja, Patarėja', '(0 5) 209 6688', '[email protected]' FROM mps WHERE name = 'Dalia Asanavičiūtė-Gružauskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolita PELECKIENĖ', 'Padėjėja', '(0 5) 209 6688', '' FROM mps WHERE name = 'Dalia Asanavičiūtė-Gružauskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Tomas RAULINAVIČIUS', 'Padėjėjas', '(0 5) 209 6688', '' FROM mps WHERE name = 'Dalia Asanavičiūtė-Gružauskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simona ŠIMANSKIENĖ', 'Patarėja', '(0 5) 209 6688', '[email protected]' FROM mps WHERE name = 'Dalia Asanavičiūtė-Gružauskienė';

-- Darius Jakavičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva ANUŠKEVIČIENĖ', 'Patarėja', '(0 5) 209 6270', '[email protected]' FROM mps WHERE name = 'Darius Jakavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta LAURINAITIENĖ', 'Patarėja', '(0 5) 209 6270', '[email protected]' FROM mps WHERE name = 'Darius Jakavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta MAJAUSKAITĖ', 'Patarėja', '(0 5) 209 6270', '[email protected]' FROM mps WHERE name = 'Darius Jakavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dovilė RAMANAUSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6270', '[email protected]' FROM mps WHERE name = 'Darius Jakavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimantas VALIUKAS', 'Patarėjas', '(0 5) 209 6270', '[email protected]' FROM mps WHERE name = 'Darius Jakavičius';

-- Darius Razmislevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita IŠKAUSKIENĖ', 'Patarėja', '(0 5) 209 6601', '' FROM mps WHERE name = 'Darius Razmislevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė JAKUTĖ', 'Patarėja', '(0 5) 209 6601', '[email protected]' FROM mps WHERE name = 'Darius Razmislevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ginvilė PILĖNAITĖ', 'Patarėja', '(0 5) 209 6601', '[email protected]' FROM mps WHERE name = 'Darius Razmislevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Birutė PŪTIENĖ', 'Patarėja', '(0 5) 209 6740', '[email protected]' FROM mps WHERE name = 'Darius Razmislevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irma RASIKĖ', 'Patarėja', '(0 5) 209 6601', '[email protected]' FROM mps WHERE name = 'Darius Razmislevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gabija SPAIČYTĖ', 'Patarėja', '(0 5) 209 6601', '' FROM mps WHERE name = 'Darius Razmislevičius';

-- Domas Griškevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė NEIMANTAITĖ', 'Patarėja', '(0 5) 209 6616', '[email protected]' FROM mps WHERE name = 'Domas Griškevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Samanta PETRAVIČIENĖ', 'Padėjėja, Patarėja', '(0 5) 209 6616', '[email protected]' FROM mps WHERE name = 'Domas Griškevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Fausta ROZNYTĖ', 'Padėjėja', '(0 5) 209 6616', '[email protected]' FROM mps WHERE name = 'Domas Griškevičius';

-- Dovilė Šakalienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita JARUCKIENĖ', 'Padėjėja', '(0 5) 209 6632', '[email protected]' FROM mps WHERE name = 'Dovilė Šakalienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta LEONAVIČIŪTĖ', 'Padėjėja', '(0 5) 209 6632', '[email protected]' FROM mps WHERE name = 'Dovilė Šakalienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Augenis VADLUGA', 'Patarėjas', '(0 5) 209 6632', '[email protected]' FROM mps WHERE name = 'Dovilė Šakalienė';

-- Edita Rudelienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gabija GALBOGYTĖ', 'Patarėja', '(0 5) 209 6637', '[email protected]' FROM mps WHERE name = 'Edita Rudelienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Diana IKANEVIČIENĖ', 'Patarėja', '(0 5) 209 6637', '' FROM mps WHERE name = 'Edita Rudelienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Paulina PAULIUKĖNĖ', 'Patarėja', '(0 5) 209 6637', '' FROM mps WHERE name = 'Edita Rudelienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inesa ŽIDONYTĖ', 'Patarėja', '(0 5) 209 6637', '' FROM mps WHERE name = 'Edita Rudelienė';

-- Eimantas Kirkutis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vida AČIENĖ', 'Patarėja', '(0 5) 209 6638', '[email protected]' FROM mps WHERE name = 'Eimantas Kirkutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Arūnas GUMULIAUSKAS (apygardoje)', 'Patarėjas', '(0 5) 209 6638', '[email protected]' FROM mps WHERE name = 'Eimantas Kirkutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Emilija JANKAUSKAITĖ', 'Patarėja', '(0 5) 239 6291', '[email protected]' FROM mps WHERE name = 'Eimantas Kirkutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janė KEKIENĖ', 'Patarėja', '(0 5) 209 6638', '[email protected]' FROM mps WHERE name = 'Eimantas Kirkutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Regina KVEDARIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6638', '[email protected]' FROM mps WHERE name = 'Eimantas Kirkutis';

-- Emanuelis Zingeris
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Auksė DRANSARD', 'Patarėja', '(0 5) 209 6644', '[email protected]' FROM mps WHERE name = 'Emanuelis Zingeris';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lukas GRINIUS', 'Patarėjas', '(0 5) 209 6644', '[email protected]' FROM mps WHERE name = 'Emanuelis Zingeris';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramunė JURKEVIČIENĖ', 'Patarėja', '(0 5) 209 6644', '[email protected]' FROM mps WHERE name = 'Emanuelis Zingeris';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simonas KLIMANSKIS', 'Patarėjas', '(0 5) 209 6644', '[email protected]' FROM mps WHERE name = 'Emanuelis Zingeris';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jovita MORKŪNAITĖ', 'Patarėja', '(0 5) 209 6644', '[email protected]' FROM mps WHERE name = 'Emanuelis Zingeris';

-- Eugenijus Gentvilas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Erika SAKALAUSKAITĖ', 'Patarėja', '(0 5) 209 6351', '[email protected]' FROM mps WHERE name = 'Eugenijus Gentvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintaras VAIČEKAUSKAS', 'Patarėjas', '(0 5) 209 6311', '[email protected]' FROM mps WHERE name = 'Eugenijus Gentvilas';

-- Eugenijus Sabutis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra ANDREJEVA', 'Padėjėja', '(0 5) 209 6979', '' FROM mps WHERE name = 'Eugenijus Sabutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė BAGDONAVIČIENĖ', 'Padėjėja, Patarėja', '0 612 20465', '[email protected]' FROM mps WHERE name = 'Eugenijus Sabutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Birutė GAILIENĖ', 'Padėjėja', '(0 5) 209 6979', '' FROM mps WHERE name = 'Eugenijus Sabutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Monika TAMINSKIENĖ', 'Padėjėja', '(0 5) 209 6979', '[email protected]' FROM mps WHERE name = 'Eugenijus Sabutis';

-- Giedrimas Jeglinskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Karolina BARIŠAUSKIENĖ', 'Patarėja', '(0 5) 209 6554', '[email protected]' FROM mps WHERE name = 'Giedrimas Jeglinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sigita SKROBLIENĖ', 'Patarėja', '(0 5) 209 6597', '[email protected]' FROM mps WHERE name = 'Giedrimas Jeglinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ervinas ŠURKA', 'Patarėjas', '(0 5) 209 6766', '[email protected]' FROM mps WHERE name = 'Giedrimas Jeglinskas';

-- Giedrius Drukteinis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Viktorija ANCUTAITĖ', 'Patarėja', '(0 5) 209 6334', '[email protected]' FROM mps WHERE name = 'Giedrius Drukteinis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantė BIMBIRIENĖ', 'Patarėja', '(0 5) 209 6334', '' FROM mps WHERE name = 'Giedrius Drukteinis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irma ČAPLINSKIENĖ', 'Patarėja', '(0 5) 209 6334', '' FROM mps WHERE name = 'Giedrius Drukteinis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra ZONGAILIENĖ', 'Patarėja', '(0 5) 209 6334', '' FROM mps WHERE name = 'Giedrius Drukteinis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Natalija ŽUKOVSKAJA ZILBER', 'Patarėja', '(0 5) 209 6334', '[email protected]' FROM mps WHERE name = 'Giedrius Drukteinis';

-- Giedrė Balčytytė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Justinas RIZGELIS', 'Patarėjas', '(0 5) 209 6713', '[email protected]' FROM mps WHERE name = 'Giedrė Balčytytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Martynas ŠIURKUS', 'Patarėjas', '(0 5) 209 6713', '' FROM mps WHERE name = 'Giedrė Balčytytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Juozas VALČIUKAS', 'Patarėjas', '(0 5) 209 6713', '[email protected]' FROM mps WHERE name = 'Giedrė Balčytytė';

-- Gintarė Skaistė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilija BARTAŠIENĖ', 'Patarėja', '(0 5) 209 6635', '' FROM mps WHERE name = 'Gintarė Skaistė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Hermantė BRANDIŠAUSKAITĖ', 'Patarėja', '(0 5) 209 6635', '[email protected]' FROM mps WHERE name = 'Gintarė Skaistė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė KAMINSKIENĖ', 'Patarėja', '(0 5) 209 6635', '[email protected]' FROM mps WHERE name = 'Gintarė Skaistė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramūnas KARTENIS', 'Patarėjas', '(0 5) 209 6635', '[email protected]' FROM mps WHERE name = 'Gintarė Skaistė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gediminas ŠINKŪNAS', 'Patarėjas', '(0 5) 209 6635', '' FROM mps WHERE name = 'Gintarė Skaistė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ugnė ŽAKEVIČIENĖ', 'Patarėja', '(0 5) 209 6635', '[email protected]' FROM mps WHERE name = 'Gintarė Skaistė';

-- Gintautas Paluckas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidas LANKAUSKAS', 'Patarėjas', '(0 5) 209 6667', '' FROM mps WHERE name = 'Gintautas Paluckas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rima RIMKUTĖ', 'Patarėja', '(0 5) 209 6667', '' FROM mps WHERE name = 'Gintautas Paluckas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramunė SAKALAUSKAITĖ', 'Patarėja', '(0 5) 209 6667', '' FROM mps WHERE name = 'Gintautas Paluckas';

-- Ignas Vėgėlė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Evelina DATENĖ', 'Patarėja', '(0 5) 209 6674', '[email protected]' FROM mps WHERE name = 'Ignas Vėgėlė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julija VORONOVAITĖ-MATIJOŠIENĖ', 'Patarėja', '(0 5) 209 6674', '[email protected]' FROM mps WHERE name = 'Ignas Vėgėlė';

-- Ilona Gelažnikienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inga ČIRVINSKIENĖ (apygardoje)', 'Padėjėja', '0 611 39314', '[email protected]' FROM mps WHERE name = 'Ilona Gelažnikienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janė GALVOSIENĖ (apygardoje)', 'Padėjėja', '0 611 20743', '[email protected]' FROM mps WHERE name = 'Ilona Gelažnikienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Erika JUNEVIČIENĖ (apygardoje)', 'Padėjėja', '0 611 20707', '[email protected]' FROM mps WHERE name = 'Ilona Gelažnikienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Stanislava SABALIAUSKIENĖ', 'Patarėja', '0 610 14580 (0 5) 209 6634', '[email protected]' FROM mps WHERE name = 'Ilona Gelažnikienė';

-- Indrė Kižienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lina BAUBLIENĖ', 'Patarėja', '(0 5) 209 6675', '[email protected]' FROM mps WHERE name = 'Indrė Kižienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Darius KROGERTAS', 'Patarėjas', '(0 5) 209 6675', '' FROM mps WHERE name = 'Indrė Kižienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vykintas LUČIŪNAS', 'Patarėjas', '(0 5) 209 6675', '' FROM mps WHERE name = 'Indrė Kižienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidutė SAKOLNIKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6675', '' FROM mps WHERE name = 'Indrė Kižienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Solveiga ULIENĖ-VEIKALIENĖ', 'Patarėja', '(0 5) 209 6675', '[email protected]' FROM mps WHERE name = 'Indrė Kižienė';

-- Inga Ruginienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marija ANGELOSKA', 'Padėjėja', '(0 5) 209 6707', '[email protected]' FROM mps WHERE name = 'Inga Ruginienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Anastasija BOJOG', 'Padėjėja', '(0 5) 209 6707', '' FROM mps WHERE name = 'Inga Ruginienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Evelina ŠILINYTĖ', 'Patarėja', '(0 5) 209 6707', '[email protected]' FROM mps WHERE name = 'Inga Ruginienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgis VALIUKEVIČIUS', 'Padėjėjas, Patarėjas', '(0 5) 209 6707', '[email protected]' FROM mps WHERE name = 'Inga Ruginienė';

-- Ingrida Braziulienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Romualdas SAKALAUSKAS', 'Padėjėjas', '(0 5) 209 6718', '[email protected]' FROM mps WHERE name = 'Ingrida Braziulienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simona SAMOŠKIENĖ', 'Patarėja', '(0 5) 209 6718', '' FROM mps WHERE name = 'Ingrida Braziulienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta ŠIMKUVIENĖ', 'Patarėja', '(0 5) 209 6718', '[email protected]' FROM mps WHERE name = 'Ingrida Braziulienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Džioraldas ŠUKYS', 'Patarėjas', '(0 5) 209 6718', '[email protected]' FROM mps WHERE name = 'Ingrida Braziulienė';

-- Ingrida Šimonytė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kamilė GOGELIENĖ', 'Patarėja', '(0 5) 209 6978', '[email protected]' FROM mps WHERE name = 'Ingrida Šimonytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Paulina LEVICKYTĖ', 'Patarėja', '(0 5) 209 6844', '[email protected]' FROM mps WHERE name = 'Ingrida Šimonytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva SKARELYTĖ', 'Patarėja', '(0 5) 209 6978', '[email protected]' FROM mps WHERE name = 'Ingrida Šimonytė';

-- Jaroslav Narkevič
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Pavel ABUCEVIČ', 'Patarėjas', '(0 5) 209 6710', '' FROM mps WHERE name = 'Jaroslav Narkevič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Zofija ABUCEVIČ', 'Patarėja', '(0 5) 209 6710', '[email protected]' FROM mps WHERE name = 'Jaroslav Narkevič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edgar ALKOVSKIJ', 'Patarėjas', '(0 5) 209 6710', '' FROM mps WHERE name = 'Jaroslav Narkevič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina DZERŽINSKA', 'Patarėja', '(0 5) 209 6710', '' FROM mps WHERE name = 'Jaroslav Narkevič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vanda KRAVČIONOK', 'Patarėja', '(0 5) 209 6710', '[email protected]' FROM mps WHERE name = 'Jaroslav Narkevič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Slavomir SUBOTOVIČ', 'Patarėjas', '(0 5) 209 6710', '' FROM mps WHERE name = 'Jaroslav Narkevič';

-- Jekaterina Rojaka
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva JOVAIŠĖ', 'Patarėja', '(0 5) 209 6652', '[email protected]' FROM mps WHERE name = 'Jekaterina Rojaka';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas LAMAUSKAS', 'Patarėjas', '(0 5) 209 6652', '[email protected]' FROM mps WHERE name = 'Jekaterina Rojaka';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julija NOVIKOVA', 'Patarėja', '(0 5) 209 6652', '[email protected]' FROM mps WHERE name = 'Jekaterina Rojaka';

-- Jevgenij Šuklin
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Virginija AUKŠTUOLIENĖ', 'Patarėja', '(0 5) 209 6642', '[email protected]' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Viačeslav GOTOVSKIJ', 'Padėjėjas', '(0 5) 209 6642', '[email protected]' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sergejus KOTOVAS (apygardoje)', 'Padėjėjas', '(0 5) 209 6642', '' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidas KURGANAS', 'Patarėjas', '(0 5) 209 6642', '[email protected]' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Nedas LUKOŠEVIČIUS (apygardoje)', 'Padėjėjas', '(0 5) 209 6642', '' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Olga MANC (apygardoje)', 'Patarėja', '0 615 23331', '[email protected]' FROM mps WHERE name = 'Jevgenij Šuklin';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kęstutis STANKEVIČIUS', 'Padėjėjas', '(0 5) 209 6642', '' FROM mps WHERE name = 'Jevgenij Šuklin';

-- Julius Sabatauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sigita BURBIENĖ', 'Patarėja', '(0 5) 209 6619', '[email protected]' FROM mps WHERE name = 'Julius Sabatauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vida GEDMINTAITĖ', 'Patarėja', '(0 5) 209 6697', '[email protected]' FROM mps WHERE name = 'Julius Sabatauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rita KARPAVIČIŪTĖ', 'Patarėja', '(0 5) 209 6586', '[email protected]' FROM mps WHERE name = 'Julius Sabatauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irmantas VERENIUS', 'Patarėjas', '(0 5) 209 6697', '[email protected]' FROM mps WHERE name = 'Julius Sabatauskas';

-- Juozas Olekas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Arvydas DOMANSKIS', 'Padėjėjas', '(0 5) 209 6005', '[email protected]' FROM mps WHERE name = 'Juozas Olekas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė KAČINSKIENĖ', 'Patarėja', '(0 5) 209 6440', '[email protected]' FROM mps WHERE name = 'Juozas Olekas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Daiva MIKULSKIENĖ', 'Padėjėja', '(0 5) 209 6256', '[email protected]' FROM mps WHERE name = 'Juozas Olekas';

-- Jurgis Razma
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta PETRAUSKIENĖ', 'Patarėja', '(0 5) 209 6602', '[email protected]' FROM mps WHERE name = 'Jurgis Razma';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edgaras PILYPAITIS', 'Patarėjas', '(0 5) 209 6693', '[email protected]' FROM mps WHERE name = 'Jurgis Razma';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dainora VAIČIKAUSKIENĖ', 'Padėjėja', '(0 5) 209 6693', '[email protected]' FROM mps WHERE name = 'Jurgis Razma';

-- Jurgita Sejonienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aurėja JUTELYTĖ', 'Patarėja', '(0 5) 209 6670', '[email protected]' FROM mps WHERE name = 'Jurgita Sejonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Violeta MARKEVIČIENĖ', 'Patarėja', '(0 5) 209 6670', '' FROM mps WHERE name = 'Jurgita Sejonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lina ŠLAMIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6670', '[email protected]' FROM mps WHERE name = 'Jurgita Sejonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simona VIRBICKIENĖ', 'Patarėja', '(0 5) 209 6670', '[email protected]' FROM mps WHERE name = 'Jurgita Sejonienė';

-- Jurgita Šukevičienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marija ANGELOSKA', 'Patarėja', '(0 5) 209 6625', '[email protected]' FROM mps WHERE name = 'Jurgita Šukevičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edita JURČIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6625', '[email protected]' FROM mps WHERE name = 'Jurgita Šukevičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Evelina VIZBARĖ', 'Patarėja', '(0 5) 209 6625', '[email protected]' FROM mps WHERE name = 'Jurgita Šukevičienė';

-- Jūratė Zailskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalia BREDELIENĖ', 'Patarėja', '(0 5) 209 6672', '' FROM mps WHERE name = 'Jūratė Zailskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Paulina KUŠNEROVIENĖ', 'Patarėja', '(0 5) 209 6672', '' FROM mps WHERE name = 'Jūratė Zailskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Daiva MACIJAUSKIENĖ', 'Patarėja', '(0 5) 209 6672', '' FROM mps WHERE name = 'Jūratė Zailskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vyda MARCEVIČIENĖ', 'Patarėja', '(0 5) 209 6672', '' FROM mps WHERE name = 'Jūratė Zailskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas RUKAS', 'Patarėjas', '(0 5) 209 6672', '' FROM mps WHERE name = 'Jūratė Zailskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Silvinija SIMONAITYTĖ', 'Patarėja', '(0 5) 209 6672', '[email protected]' FROM mps WHERE name = 'Jūratė Zailskienė';

-- Karolis Neimantas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilija MASKELIENĖ', 'Patarėja', '0 610 25745', '[email protected]' FROM mps WHERE name = 'Karolis Neimantas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laima VAIČIULIENĖ', 'Patarėja', '0 686 91326 (0 5) 209 6711', '[email protected]' FROM mps WHERE name = 'Karolis Neimantas';

-- Karolis Podolskis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Milda RAITELAITIENĖ', 'Patarėja', '0 611 29791 (0 5) 209 6263', '[email protected]' FROM mps WHERE name = 'Karolis Podolskis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Indra ŠČIGLINSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6705', '[email protected]' FROM mps WHERE name = 'Karolis Podolskis';

-- Kazys Starkevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rasa BARKAUSKIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6401', '' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eva DALINKEVIČIENĖ', 'Padėjėja', '(0 5) 209 6401', '[email protected]' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rasa DUOBAITĖ-BUMBULIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6401', '[email protected]' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimantas KAUŠIKAS', 'Patarėjas', '0 612 01318 (0 5) 209 6401', '[email protected]' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vitalija MILEVIČIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6401', '' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danutė PUKĖNIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6401', '' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laura RAMANAUSKAITĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6401', '' FROM mps WHERE name = 'Kazys Starkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laurynas ZUBAVIČIUS (apygardoje)', 'Padėjėjas', '(0 5) 209 6401', '' FROM mps WHERE name = 'Kazys Starkevičius';

-- Kęstutis Bilius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalė ANDREIKĖNIENĖ', 'Patarėja', '(0 5) 209 6626', '[email protected]' FROM mps WHERE name = 'Kęstutis Bilius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lina KRENCEVIČIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6626', '' FROM mps WHERE name = 'Kęstutis Bilius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eugenija NEVERDAUSKIENĖ', 'Patarėja', '(0 5) 209 6626', '' FROM mps WHERE name = 'Kęstutis Bilius';

-- Kęstutis Mažeika
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Karolis BABECKAS', 'Patarėjas', '(0 5) 209 6691', '' FROM mps WHERE name = 'Kęstutis Mažeika';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas BALNIUS', 'Patarėjas', '(0 5) 209 6691', '' FROM mps WHERE name = 'Kęstutis Mažeika';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimas MARČIULYNAS (apygardoje)', 'Patarėjas', '(0 5) 209 6691', '' FROM mps WHERE name = 'Kęstutis Mažeika';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Arminas MOCKEVIČIUS', 'Patarėjas', '(0 5) 209 6691', '[email protected]' FROM mps WHERE name = 'Kęstutis Mažeika';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kęstas SPŪDYS', 'Patarėjas', '(0 5) 209 6691', '[email protected]' FROM mps WHERE name = 'Kęstutis Mažeika';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laura STRAŽNICKIENĖ', 'Patarėja', '(0 5) 209 6691', '[email protected]' FROM mps WHERE name = 'Kęstutis Mažeika';

-- Kęstutis Vilkauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina ČELKĖ', 'Patarėja', '(0 5) 209 6335', '[email protected]' FROM mps WHERE name = 'Kęstutis Vilkauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Elzbieta JUKNEVIČIŪTĖ (apygardoje)', 'Patarėja', '(0 5) 209 6335', '[email protected]' FROM mps WHERE name = 'Kęstutis Vilkauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Giedrė ŽUROMSKIENĖ', 'Patarėja', '0 612 20922', '[email protected]' FROM mps WHERE name = 'Kęstutis Vilkauskas';

-- Laura Asadauskaitė-Zadneprovskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gedeminas ALEKSONIS', 'Patarėjas', '(0 5) 209 6678', '[email protected]' FROM mps WHERE name = 'Laura Asadauskaitė-Zadneprovskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilius ALELIŪNAS', 'Padėjėjas', '(0 5) 209 6678', '[email protected]' FROM mps WHERE name = 'Laura Asadauskaitė-Zadneprovskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Renata CECHONIENĖ', 'Padėjėja', '(0 5) 209 6678', '' FROM mps WHERE name = 'Laura Asadauskaitė-Zadneprovskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Povilas SAULEVIČIUS', 'Padėjėjas', '(0 5) 209 6678', '' FROM mps WHERE name = 'Laura Asadauskaitė-Zadneprovskienė';

-- Laurynas Kasčiūnas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Emilė BALODYTĖ', 'Patarėja', '(0 5) 209 6983', '[email protected]' FROM mps WHERE name = 'Laurynas Kasčiūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta BIZAITĖ', 'Patarėja', '(0 5) 209 6983', '[email protected]' FROM mps WHERE name = 'Laurynas Kasčiūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simonas KLIMANSKIS', 'Patarėjas', '(0 5) 209 6983', '[email protected]' FROM mps WHERE name = 'Laurynas Kasčiūnas';

-- Laurynas Šedvydis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Roberta AŽUKAITĖ', 'Padėjėja', '(0 5) 209 6659', '[email protected]' FROM mps WHERE name = 'Laurynas Šedvydis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Povilas JAGELAVIČIUS', 'Padėjėjas', '(0 5) 209 6659', '[email protected]' FROM mps WHERE name = 'Laurynas Šedvydis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mavliuda ŠTRUPKIENĖ', 'Padėjėja', '(0 5) 209 6659', '[email protected]' FROM mps WHERE name = 'Laurynas Šedvydis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimvydas ŠVEDAS', 'Padėjėjas', '(0 5) 209 6659', '' FROM mps WHERE name = 'Laurynas Šedvydis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Indrė VILNIŠKYTĖ', 'Padėjėja, Patarėja', '(0 5) 209 6659', '[email protected]' FROM mps WHERE name = 'Laurynas Šedvydis';

-- Ligita Girskienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Roma GABRIENĖ', 'Patarėja', '(0 5) 209 6610', '[email protected]' FROM mps WHERE name = 'Ligita Girskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė IVONĖ', 'Patarėja', '(0 5) 209 6610', '' FROM mps WHERE name = 'Ligita Girskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laimutė JUDICKIENĖ', 'Patarėja', '(0 5) 209 6610', '[email protected]' FROM mps WHERE name = 'Ligita Girskienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytis TURONIS', 'Patarėjas', '(0 5) 209 6610', '[email protected]' FROM mps WHERE name = 'Ligita Girskienė';

-- Lilija Vaitiekūnienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė GARŠVAITĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6714,(0 5) 209 6721', '' FROM mps WHERE name = 'Lilija Vaitiekūnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dovilė MARINSKIENĖ (apygardoje)', 'Padėjėja', '0 610 21209', '[email protected]' FROM mps WHERE name = 'Lilija Vaitiekūnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irena MEŠKAUSKIENĖ (apygardoje)', 'Padėjėja', '0 610 62916', '[email protected]' FROM mps WHERE name = 'Lilija Vaitiekūnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Liudvika RASLANIENĖ', 'Patarėja', '(0 5) 209 6714,(0 5) 209 6721', '[email protected]' FROM mps WHERE name = 'Lilija Vaitiekūnienė';

-- Lina Šukytė-Korsakė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Arnomedas GALDIKAS', 'Patarėjas', '(0 5) 209 6671', '' FROM mps WHERE name = 'Lina Šukytė-Korsakė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ina ŠTITILIENĖ', 'Patarėja', '(0 5) 209 6671', '' FROM mps WHERE name = 'Lina Šukytė-Korsakė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ilona VITKĖ', 'Patarėja', '(0 5) 209 6671', '' FROM mps WHERE name = 'Lina Šukytė-Korsakė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Žydrūnas VITKUS', 'Patarėjas', '(0 5) 209 6671', '[email protected]' FROM mps WHERE name = 'Lina Šukytė-Korsakė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra ZLATKUVIENĖ', 'Patarėja', '(0 5) 209 6671', '' FROM mps WHERE name = 'Lina Šukytė-Korsakė';

-- Linas Balsys
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sonata DIRSYTĖ', 'Patarėja', '(0 5) 209 6550', '[email protected]' FROM mps WHERE name = 'Linas Balsys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kornelija PETRAVIČIENĖ', 'Patarėja', '(0 5) 209 6550', '[email protected]' FROM mps WHERE name = 'Linas Balsys';

-- Linas Jonauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Remigijus BARANAUSKAS', 'Patarėjas', '(0 5) 209 6726', '[email protected]' FROM mps WHERE name = 'Linas Jonauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sonata DIRSYTĖ', 'Patarėja', '(0 5) 209 6726', '[email protected]' FROM mps WHERE name = 'Linas Jonauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aurimas RABAČIUS', 'Patarėjas', '(0 5) 209 6726', '' FROM mps WHERE name = 'Linas Jonauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Toma SONGAILIENĖ', 'Patarėja', '(0 5) 209 6726', '[email protected]' FROM mps WHERE name = 'Linas Jonauskas';

-- Linas Kukuraitis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Antanas BAURA (apygardoje)', 'Patarėjas', '(0 5) 209 6663', '[email protected]' FROM mps WHERE name = 'Linas Kukuraitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Juozas BERNATAVIČIUS', 'Patarėjas', '(0 5) 209 6663', '[email protected]' FROM mps WHERE name = 'Linas Kukuraitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalia SAKALAUSKAITĖ-BABRAVIČĖ', 'Patarėja', '(0 5) 209 6597', '[email protected]' FROM mps WHERE name = 'Linas Kukuraitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alytė SKEBERIENĖ', 'Patarėja', '(0 5) 209 6663', '' FROM mps WHERE name = 'Linas Kukuraitis';

-- Linas Urmanavičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita KURAUSKIENĖ', 'Padėjėja', '(0 5) 209 6662', '' FROM mps WHERE name = 'Linas Urmanavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Diana SINKEVIČIŪTĖ-GRIEŽĖ', 'Padėjėja', '(0 5) 209 6662', '[email protected]' FROM mps WHERE name = 'Linas Urmanavičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rasa SMIRNOVA', 'Patarėja', '(0 5) 209 6662', '[email protected]' FROM mps WHERE name = 'Linas Urmanavičius';

-- Liutauras Kazlavickas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina GOGELIENĖ', 'Padėjėja', '(0 5) 209 6622', '' FROM mps WHERE name = 'Liutauras Kazlavickas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Juta KAZLAUSKIENĖ', 'Padėjėja', '(0 5) 209 6622', '[email protected]' FROM mps WHERE name = 'Liutauras Kazlavickas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Giedrė RAKAUSKIENĖ', 'Padėjėja', '(0 5) 209 6622', '[email protected]' FROM mps WHERE name = 'Liutauras Kazlavickas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalia VYSKUPAITYTĖ-ŠAUČIŪNIENĖ', 'Padėjėja, Patarėja', '(0 5) 209 6622', '[email protected]' FROM mps WHERE name = 'Liutauras Kazlavickas';

-- Lukas Savickas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kotryna BUTKIENĖ', 'Patarėja', '(0 5) 209 6651', '[email protected]' FROM mps WHERE name = 'Lukas Savickas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Fausta ROZNYTĖ', 'Patarėja', '(0 5) 209 6651', '[email protected]' FROM mps WHERE name = 'Lukas Savickas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ervinas ŠURKA', 'Patarėjas', '(0 5) 209 6651', '[email protected]' FROM mps WHERE name = 'Lukas Savickas';

-- Mantas Poškus
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Taidė RAMANAUSKĖ (apygardoje)', 'Patarėja', '0 611 31389', '[email protected]' FROM mps WHERE name = 'Mantas Poškus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Liveta SNITKIENĖ (apygardoje)', 'Patarėja', '0 611 31350', '[email protected]' FROM mps WHERE name = 'Mantas Poškus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gediminas VASILIAUSKAS', 'Patarėjas', '(0 5) 209 6722', '[email protected]' FROM mps WHERE name = 'Mantas Poškus';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Justas ŽMĖJAUSKAS', 'Patarėjas', '0 611 28459 (0 5) 209 6722', '[email protected]' FROM mps WHERE name = 'Mantas Poškus';

-- Martynas Gedvilas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irena LEVICKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6612', '[email protected]' FROM mps WHERE name = 'Martynas Gedvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė LUKOČIENĖ', 'Patarėja', '(0 5) 209 6612', '[email protected]' FROM mps WHERE name = 'Martynas Gedvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė VAIVADAITĖ', 'Patarėja', '(0 5) 209 6612', '' FROM mps WHERE name = 'Martynas Gedvilas';

-- Martynas Katelynas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Skaistė BESUSPARYTĖ', 'Patarėja', '0 628  48 992', '[email protected]' FROM mps WHERE name = 'Martynas Katelynas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra LEGATIENĖ', 'Patarėja', '(0 5) 209 6621', '[email protected]' FROM mps WHERE name = 'Martynas Katelynas';

-- Matas Maldeikis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Egidijus GIEDRAITIS', 'Patarėjas', '(0 5) 209 6606', '' FROM mps WHERE name = 'Matas Maldeikis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta MACKEVIČIENĖ', 'Patarėja', '(0 5) 209 6606', '[email protected]' FROM mps WHERE name = 'Matas Maldeikis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aistė PIKŠRYTĖ', 'Patarėja', '(0 5) 209 6606', '' FROM mps WHERE name = 'Matas Maldeikis';

-- Matas Skamarakas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Deivydas GRABAUSKAS', 'Patarėjas', '(0 5) 209 6681', '[email protected]' FROM mps WHERE name = 'Matas Skamarakas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Diana KAUPAITIENĖ', 'Patarėja', '(0 5) 209 6681', '' FROM mps WHERE name = 'Matas Skamarakas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Erika ŠUTJEVIENĖ', 'Patarėja', '(0 5) 209 6681', '[email protected]' FROM mps WHERE name = 'Matas Skamarakas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta VIČIENĖ', 'Patarėja', '(0 5) 209 6681', '' FROM mps WHERE name = 'Matas Skamarakas';

-- Mindaugas Lingė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alida JUCEVIČĖ', 'Patarėja', '(0 5) 209 6631', '[email protected]' FROM mps WHERE name = 'Mindaugas Lingė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jovydas JUOCEVIČIUS', 'Patarėjas', '(0 5) 209 6631', '[email protected]' FROM mps WHERE name = 'Mindaugas Lingė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julijonas ŠILEIKA', 'Patarėjas', '(0 5) 209 6631', '[email protected]' FROM mps WHERE name = 'Mindaugas Lingė';

-- Modesta Petrauskaitė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaiva DIDŽIULYTĖ', 'Patarėja', '(0 5) 209 6673', '[email protected]' FROM mps WHERE name = 'Modesta Petrauskaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Silvinija SIMONAITYTĖ', 'Patarėja', '(0 5) 209 6673', '[email protected]' FROM mps WHERE name = 'Modesta Petrauskaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gabrielė ŽIOGELĖ', 'Patarėja', '(0 5) 209 6673', '' FROM mps WHERE name = 'Modesta Petrauskaitė';

-- Orinta Leiputė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jūratė BARŠAUSKAITĖ', 'Patarėja', '(0 5) 209 6352', '[email protected]' FROM mps WHERE name = 'Orinta Leiputė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Karolis KLIMKA', 'Patarėjas', '(0 5) 209 6285', '[email protected]' FROM mps WHERE name = 'Orinta Leiputė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mindaugas SĖJŪNAS', 'Patarėjas', '(0 5) 209 6731', '' FROM mps WHERE name = 'Orinta Leiputė';

-- Paulius Visockas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta KAPOČIŪTĖ-DAUNIENĖ', 'Patarėja', '(0 5) 209 6636', '[email protected]' FROM mps WHERE name = 'Paulius Visockas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Monika KIAUŠAITĖ', 'Patarėja', '(0 5) 209 6636', '' FROM mps WHERE name = 'Paulius Visockas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Viktoras KRAJINAS', 'Patarėjas', '(0 5) 209 6636', '' FROM mps WHERE name = 'Paulius Visockas';

-- Paulė Kuzmickienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Agnė ARLIKEVIČIŪTĖ', 'Padėjėja', '(0 5) 209 6640', '[email protected]' FROM mps WHERE name = 'Paulė Kuzmickienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aurelija AURUŠKEVIČIENĖ', 'Patarėja', '(0 5) 209 6640', '[email protected]' FROM mps WHERE name = 'Paulė Kuzmickienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gabrielė GRIAUZDAITĖ-PATUMSIENĖ', 'Padėjėja', '(0 5) 209 6640', '[email protected]' FROM mps WHERE name = 'Paulė Kuzmickienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laurynas KAMINSKAS', 'Patarėjas', '(0 5) 209 6640', '' FROM mps WHERE name = 'Paulė Kuzmickienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Justyna KOZLOVSKAJA', 'Padėjėja', '(0 5) 209 6640', '' FROM mps WHERE name = 'Paulė Kuzmickienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gabrielė ŽAIDYTĖ', 'Padėjėja', '(0 5) 209 6640', '[email protected]' FROM mps WHERE name = 'Paulė Kuzmickienė';

-- Petras Dargis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Nemira ALIUKONIENĖ', 'Patarėja', '(0 5) 209 6618', '[email protected]' FROM mps WHERE name = 'Petras Dargis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaida KUUZ (apygardoje)', 'Patarėja', '(0 5) 209 6618', '[email protected]' FROM mps WHERE name = 'Petras Dargis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Juozas PETKUS (apygardoje)', 'Patarėjas', '(0 5) 209 6618', '[email protected]' FROM mps WHERE name = 'Petras Dargis';

-- Radvilė Morkūnaitė-Mikulėnienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Romena ČIŪTIENĖ', 'Patarėja', '(0 5) 209 6611', '[email protected]' FROM mps WHERE name = 'Radvilė Morkūnaitė-Mikulėnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva DAUSKURTĖ', 'Patarėja', '(0 5) 209 6273', '[email protected]' FROM mps WHERE name = 'Radvilė Morkūnaitė-Mikulėnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rima NORVILIENĖ', 'Patarėja', '(0 5) 209 6657', '[email protected]' FROM mps WHERE name = 'Radvilė Morkūnaitė-Mikulėnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Liuda POCIŪNIENĖ', 'Patarėja', '(0 5) 209 6657', '[email protected]' FROM mps WHERE name = 'Radvilė Morkūnaitė-Mikulėnienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Teodoras Jonas ŽUKAS', 'Patarėjas', '(0 5) 209 6657', '[email protected]' FROM mps WHERE name = 'Radvilė Morkūnaitė-Mikulėnienė';

-- Raimondas Kuodis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina BUTVILAVIČIENĖ', 'Padėjėja', '(0 5) 209 6959', '[email protected]' FROM mps WHERE name = 'Raimondas Kuodis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jonas NOVOGRECKIS', 'Padėjėjas', '(0 5) 209 6959', '' FROM mps WHERE name = 'Raimondas Kuodis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva SKARELYTĖ', 'Padėjėja', '(0 5) 209 6959', '[email protected]' FROM mps WHERE name = 'Raimondas Kuodis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Remigija TAUROKIENĖ', 'Padėjėja', '(0 5) 209 6959', '' FROM mps WHERE name = 'Raimondas Kuodis';

-- Raimondas Šukys
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janina KUMPIENĖ', 'Patarėja', '(0 5) 209 6687', '[email protected]' FROM mps WHERE name = 'Raimondas Šukys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas TARAILĖ', 'Patarėjas', '(0 5) 209 6687', '[email protected]' FROM mps WHERE name = 'Raimondas Šukys';

-- Raminta Popovienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gražina ANANIKOVIENĖ', 'Patarėja', '(0 5) 209 6679', '[email protected]' FROM mps WHERE name = 'Raminta Popovienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jūratė KUZMICKAITĖ', 'Patarėja', '(0 5) 209 6679', '' FROM mps WHERE name = 'Raminta Popovienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina MIŠKINIENĖ', 'Patarėja', '(0 5) 209 6679', '' FROM mps WHERE name = 'Raminta Popovienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Skirmantė SUBAČIENĖ', 'Patarėja', '(0 5) 209 6679', '' FROM mps WHERE name = 'Raminta Popovienė';

-- Ramūnas Vyžintas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė LĖVERIENĖ', 'Patarėja', '(0 5) 209 6650', '[email protected]' FROM mps WHERE name = 'Ramūnas Vyžintas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Žydrūnas MICHNEVIČIUS (apygardoje)', 'Padėjėjas', '0 611 34760', '[email protected]' FROM mps WHERE name = 'Ramūnas Vyžintas';

-- Rasa Budbergytė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Antanas BERTAŠIUS', 'Patarėjas', '(0 5) 209 6699', '' FROM mps WHERE name = 'Rasa Budbergytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantas JONELIS', 'Patarėjas', '(0 5) 209 6699', '' FROM mps WHERE name = 'Rasa Budbergytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Žana VAITKUVIENĖ-ZIMINA', 'Patarėja', '(0 5) 209 6699', '' FROM mps WHERE name = 'Rasa Budbergytė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jūratė ŽULPAITĖ', 'Patarėja', '(0 5) 209 6699', '' FROM mps WHERE name = 'Rasa Budbergytė';

-- Remigijus Motuzas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Daniel BOCEVIČ', 'Patarėjas', '(0 5) 209 6609', '' FROM mps WHERE name = 'Remigijus Motuzas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Tomas BUDRIKIS', 'Patarėjas', '(0 5) 209 6609', '' FROM mps WHERE name = 'Remigijus Motuzas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta MAJAUSKAITĖ', 'Patarėja', '(0 5) 209 6609', '[email protected]' FROM mps WHERE name = 'Remigijus Motuzas';

-- Remigijus Žemaitaitis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ignotas ADOMAVIČIUS', 'Patarėjas', '(0 5) 209 6972', '[email protected]' FROM mps WHERE name = 'Remigijus Žemaitaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė LUKOČIENĖ', 'Patarėja', '(0 5) 209 6972', '[email protected]' FROM mps WHERE name = 'Remigijus Žemaitaitis';

-- Rima Baškienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ada GRAKAUSKIENĖ', 'Patarėja', '(0 5) 209 6654', '[email protected]' FROM mps WHERE name = 'Rima Baškienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintaras JANČIAUSKAS', 'Patarėjas', '(0 5) 209 6654', '[email protected]' FROM mps WHERE name = 'Rima Baškienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Deividas RUMBUTIS', 'Patarėjas', '(0 5) 209 6345', '[email protected]' FROM mps WHERE name = 'Rima Baškienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantas VALUKONIS', 'Patarėjas', '(0 5) 209 6654', '[email protected]' FROM mps WHERE name = 'Rima Baškienė';

-- Rimantas Sinkevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra ANDREJEVA', 'Patarėja', '(0 5) 209 6656', '' FROM mps WHERE name = 'Rimantas Sinkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Regina SHOAIB', 'Patarėja', '(0 5) 209 6656', '[email protected]' FROM mps WHERE name = 'Rimantas Sinkevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Solveiga ULIENĖ-VEIKALIENĖ', 'Patarėja', '(0 5) 209 6280', '[email protected]' FROM mps WHERE name = 'Rimantas Sinkevičius';

-- Rimas Jonas Jankūnas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramūnas AUŠROTAS', 'Patarėjas', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Algimantas BIRBILAS', 'Patarėjas', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janina DOVYDAITIENĖ', 'Patarėja', '(0 5) 209 6893', '' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audronė JANKUVIENĖ', 'Patarėja', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janė KEKIENĖ', 'Patarėja', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidminė MISIULYTĖ-KRASAUSKIENĖ', 'Patarėja', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta PETKIENĖ', 'Patarėja', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytis TURONIS', 'Patarėjas', '(0 5) 209 6893', '[email protected]' FROM mps WHERE name = 'Rimas Jonas Jankūnas';

-- Rita Tamašunienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Tadeusz ANDRZEJEWSKI', 'Patarėjas', '(0 5) 209 6706', '[email protected]' FROM mps WHERE name = 'Rita Tamašunienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Teresa DEMEŠKO', 'Patarėja', '(0 5) 209 6706', '' FROM mps WHERE name = 'Rita Tamašunienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ivona KLIMAŠEVSKAJA', 'Patarėja', '(0 5) 209 6706', '' FROM mps WHERE name = 'Rita Tamašunienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danuta VINCKEVIČ', 'Patarėja', '(0 5) 209 6777', '[email protected]' FROM mps WHERE name = 'Rita Tamašunienė';

-- Ričardas Juška
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Žaneta JANKAUSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6676', '' FROM mps WHERE name = 'Ričardas Juška';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilma MARKŪNIENĖ', 'Patarėja', '(0 5) 209 6676', '[email protected]' FROM mps WHERE name = 'Ričardas Juška';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kazimieras ŠIMKUS', 'Patarėjas', '(0 5) 209 6676', '' FROM mps WHERE name = 'Ričardas Juška';

-- Robert Puchovič
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edita KARČIAUSKIENĖ', 'Patarėja', '(0 5) 209 6686', '[email protected]' FROM mps WHERE name = 'Robert Puchovič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rolandas VENCKUS', 'Patarėjas', '(0 5) 209 6686', '' FROM mps WHERE name = 'Robert Puchovič';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sandra VITKĖ', 'Patarėja', '(0 5) 209 6954', '[email protected]' FROM mps WHERE name = 'Robert Puchovič';

-- Robertas Kaunas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Indrius BOLISAS', 'Patarėjas', '(0 5) 209 6604', '[email protected]' FROM mps WHERE name = 'Robertas Kaunas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Donatas LATKAUSKAS', 'Patarėjas', '(0 5) 209 6604', '[email protected]' FROM mps WHERE name = 'Robertas Kaunas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Robertas STANIONIS', 'Patarėjas', '(0 5) 209 6604', '[email protected]' FROM mps WHERE name = 'Robertas Kaunas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mavliuda ŠTRUPKIENĖ', 'Patarėja', '(0 5) 209 6604', '[email protected]' FROM mps WHERE name = 'Robertas Kaunas';

-- Roma Janušonienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sigutė JAKUTIENĖ', 'Patarėja', '(0 5) 209 6020', '' FROM mps WHERE name = 'Roma Janušonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Virginijus KERAS (apygardoje)', 'Patarėjas', '(0 5) 209 6020', '' FROM mps WHERE name = 'Roma Janušonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Danguolė MASIULIENĖ', 'Patarėja', '0 611 20142', '[email protected]' FROM mps WHERE name = 'Roma Janušonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aldona MINKEVIČIENĖ', 'Patarėja', '(0 5) 209 6020', '[email protected]' FROM mps WHERE name = 'Roma Janušonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Liudvika RASLANIENĖ', 'Patarėja', '(0 5) 209 6020', '[email protected]' FROM mps WHERE name = 'Roma Janušonienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Darius ŠILKUS', 'Patarėjas', '0 655 42324', '[email protected]' FROM mps WHERE name = 'Roma Janušonienė';

-- Ruslanas Baranovas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irena ANIUKŠTIENĖ', 'Padėjėja', '(0 5) 209 6015', '' FROM mps WHERE name = 'Ruslanas Baranovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas BUINAUSKAS', 'Padėjėjas', '(0 5) 209 6015', '' FROM mps WHERE name = 'Ruslanas Baranovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Martynas MOTUZAS', 'Padėjėjas, Patarėjas', '(0 5) 209 6015', '[email protected]' FROM mps WHERE name = 'Ruslanas Baranovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Augenis VADLUGA', 'Padėjėjas', '(0 5) 209 6015', '[email protected]' FROM mps WHERE name = 'Ruslanas Baranovas';

-- Rūta Miliūtė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Nijolė GRIGONYTĖ', 'Patarėja', '(0 5) 209 6719', '[email protected]' FROM mps WHERE name = 'Rūta Miliūtė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ramunė MUZIKEVIČIŪTĖ-NARMONTIENĖ', 'Patarėja', '(0 5) 209 6719', '[email protected]' FROM mps WHERE name = 'Rūta Miliūtė';

-- Saulius Bucevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kęstutis MAČIULIS', 'Patarėjas', '(0 5) 209 6716', '' FROM mps WHERE name = 'Saulius Bucevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Paulius PERMINAS', 'Patarėjas', '(0 5) 209 6716', '' FROM mps WHERE name = 'Saulius Bucevičius';

-- Saulius Luščikas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inga CEMNOLONSKAITĖ', 'Padėjėja, Patarėja', '(0 5) 209 6827', '[email protected]' FROM mps WHERE name = 'Saulius Luščikas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Linas GARBENIS', 'Patarėjas', '(0 5) 209 6827', '[email protected]' FROM mps WHERE name = 'Saulius Luščikas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Justina ŠEREIVAITĖ (apygardoje)', 'Padėjėja', '0 611 43799', '[email protected]' FROM mps WHERE name = 'Saulius Luščikas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Zita ŽVIKIENĖ (apygardoje)', 'Padėjėja', '0 611 48067', '[email protected]' FROM mps WHERE name = 'Saulius Luščikas';

-- Saulius Skvernelis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inga BARIŠAUSKĖ', 'Patarėja', '(0 5) 209 6664', '[email protected]' FROM mps WHERE name = 'Saulius Skvernelis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Monika GIEDRIENĖ', 'Patarėja', '0 612 26154', '[email protected]' FROM mps WHERE name = 'Saulius Skvernelis';

-- Saulius Čaplinskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gedeminas ALEKSONIS', 'Patarėjas', '(0 5) 209 6603', '[email protected]' FROM mps WHERE name = 'Saulius Čaplinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vidmantas KAIRYS', 'Patarėjas', '(0 5) 209 6603', '' FROM mps WHERE name = 'Saulius Čaplinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta STAIŠIŪNAITĖ', 'Patarėja', '(0 5) 209 6603', '[email protected]' FROM mps WHERE name = 'Saulius Čaplinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Džioraldas ŠUKYS', 'Patarėjas', '(0 5) 209 6603', '[email protected]' FROM mps WHERE name = 'Saulius Čaplinskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Natalija ŽUKOVSKAJA ZILBER', 'Patarėja', '(0 5) 209 6603', '[email protected]' FROM mps WHERE name = 'Saulius Čaplinskas';

-- Simonas Gentvilas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Agnė PAULAUSKIENĖ', 'Patarėja', '(0 5) 209 6660', '[email protected]' FROM mps WHERE name = 'Simonas Gentvilas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Auksė SPUNDZEVIČIENĖ', 'Patarėja', '(0 5) 209 6660', '[email protected]' FROM mps WHERE name = 'Simonas Gentvilas';

-- Simonas Kairys
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rimantas MIKAITIS (apygardoje)', 'Patarėjas', '0 611 35920 (0 5) 209 6647', '[email protected]' FROM mps WHERE name = 'Simonas Kairys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dovilė MOTIEJAUSKAITĖ (apygardoje)', 'Patarėja', '0 623 42256 (0 5) 209 6647', '[email protected]' FROM mps WHERE name = 'Simonas Kairys';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Sigitas ŠLIAŽAS', 'Patarėjas', '0 611 16340 (0 5) 209 6647', '[email protected]' FROM mps WHERE name = 'Simonas Kairys';

-- Tadas Barauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dovilė ČERNIAUSKAITĖ', 'Patarėja', '(0 5) 209 6728', '[email protected]' FROM mps WHERE name = 'Tadas Barauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Nikolajus GUSEVAS', 'Patarėjas', '(0 5) 209 6728', '' FROM mps WHERE name = 'Tadas Barauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aldona MINKEVIČIENĖ', 'Patarėja', '(0 5) 209 6728', '[email protected]' FROM mps WHERE name = 'Tadas Barauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raminta ŠIMKUVIENĖ', 'Patarėja', '(0 5) 209 6728', '[email protected]' FROM mps WHERE name = 'Tadas Barauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kęstutis ZAKŠAUSKAS', 'Patarėjas', '(0 5) 209 6728', '[email protected]' FROM mps WHERE name = 'Tadas Barauskas';

-- Tadas Prajara
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Martinas EIMUTIS', 'Patarėjas', '(0 5) 209 6703', '[email protected]' FROM mps WHERE name = 'Tadas Prajara';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidas GUMAUSKAS (apygardoje)', 'Patarėjas', '(0 5) 209 6703', '' FROM mps WHERE name = 'Tadas Prajara';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Lina JONYTYTĖ', 'Patarėja', '(0 5) 209 6703', '[email protected]' FROM mps WHERE name = 'Tadas Prajara';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laura MATUZAITĖ', 'Patarėja', '(0 5) 209 6703', '[email protected]' FROM mps WHERE name = 'Tadas Prajara';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušra SKAMARAKIENĖ (apygardoje)', 'Patarėja', '0 686 47448', '' FROM mps WHERE name = 'Tadas Prajara';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Reimundas TYRAS', 'Patarėjas', '(0 5) 209 6703', '[email protected]' FROM mps WHERE name = 'Tadas Prajara';

-- Tadas Sadauskis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalia GRAKULSKYTĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6717', '[email protected]' FROM mps WHERE name = 'Tadas Sadauskis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Alvydas JANUŠEVIČIUS', 'Patarėjas', '(0 5) 209 6717', '[email protected]' FROM mps WHERE name = 'Tadas Sadauskis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė PALIONIENĖ', 'Patarėja', '(0 5) 209 6717', '[email protected]' FROM mps WHERE name = 'Tadas Sadauskis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rima RIMKUTĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6717', '' FROM mps WHERE name = 'Tadas Sadauskis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Marius STANEVIČIUS', 'Padėjėjas', '(0 5) 209 6717', '' FROM mps WHERE name = 'Tadas Sadauskis';

-- Tomas Domarkas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vidas KAROLIS', 'Patarėjas', '(0 5) 209 6732', '[email protected]' FROM mps WHERE name = 'Tomas Domarkas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gediminas VASILIAUSKAS', 'Patarėjas', '(0 5) 209 6732', '[email protected]' FROM mps WHERE name = 'Tomas Domarkas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edmundas ŽILEVIČIUS (apygardoje)', 'Patarėjas', '(0 5) 209 6732', '' FROM mps WHERE name = 'Tomas Domarkas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Daiva ŽINĖ-STECENKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6732', '' FROM mps WHERE name = 'Tomas Domarkas';

-- Tomas Martinaitis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Deivida GAIŽAUSKAITĖ', 'Patarėja', '(0 5) 209 6639', '[email protected]' FROM mps WHERE name = 'Tomas Martinaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Remigija KADIKINĖ', 'Patarėja', '(0 5) 209 6443', '[email protected]' FROM mps WHERE name = 'Tomas Martinaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Brigita NEMČIAUSKAITĖ', 'Patarėja', '(0 5) 209 6639', '[email protected]' FROM mps WHERE name = 'Tomas Martinaitis';

-- Tomas Tomilinas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas LAMAUSKAS', 'Patarėjas', '(0 5) 209 6614', '[email protected]' FROM mps WHERE name = 'Tomas Tomilinas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Regina PATALAUSKIENĖ', 'Patarėja', '(0 5) 209 6614', '[email protected]' FROM mps WHERE name = 'Tomas Tomilinas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Fausta ROZNYTĖ', 'Patarėja', '(0 5) 209 6614', '[email protected]' FROM mps WHERE name = 'Tomas Tomilinas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vadim VILEITA', 'Patarėjas', '(0 5) 209 6614', '' FROM mps WHERE name = 'Tomas Tomilinas';

-- Vaida Aleknavičienė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inga BRŪŽIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6570', '[email protected]' FROM mps WHERE name = 'Vaida Aleknavičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Remigija KADIKINĖ', 'Patarėja', '(0 5) 209 6443', '[email protected]' FROM mps WHERE name = 'Vaida Aleknavičienė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aistė ŠLIOŽAITĖ-SNARSKIENĖ', 'Patarėja', '(0 5) 209 6570', '[email protected]' FROM mps WHERE name = 'Vaida Aleknavičienė';

-- Valdas Rakutis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Virginijus BAČIANSKAS', 'Padėjėjas', '(0 5) 209 6613', '' FROM mps WHERE name = 'Valdas Rakutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ieva BROGIENĖ', 'Padėjėja', '(0 5) 209 6613', '[email protected]' FROM mps WHERE name = 'Valdas Rakutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas REKLAITIS', 'Padėjėjas', '(0 5) 209 6613', '' FROM mps WHERE name = 'Valdas Rakutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta SKRITULSKAITĖ', 'Padėjėja', '(0 5) 209 6613', '[email protected]' FROM mps WHERE name = 'Valdas Rakutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vladas SUNGAILA', 'Padėjėjas', '(0 5) 209 6613', '' FROM mps WHERE name = 'Valdas Rakutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vidmantas VALIUŠAITIS', 'Padėjėjas, Patarėjas', '(0 5) 209 6613', '[email protected]' FROM mps WHERE name = 'Valdas Rakutis';

-- Valius Ąžuolas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė MARTYŠIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6695', '' FROM mps WHERE name = 'Valius Ąžuolas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Reda ŠIAULIENĖ', 'Patarėja', '0 615 11855', '[email protected]' FROM mps WHERE name = 'Valius Ąžuolas';

-- Viktoras Fiodorovas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Irma BAJORŪNĖ (apygardoje)', 'Patarėja', '(0 5) 209 6696', '' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laura ČIŽIŪTĖ', 'Patarėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jovita GREIČIUVIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6696', '' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kristina KAZAKAUSKIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6696', '' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ugnė NORUŠIŪTĖ (apygardoje)', 'Patarėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jaunius SAGATAVIČIUS (apygardoje)', 'Padėjėjas', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Akvilė ŠIDLAUSKAITĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Urtė VAITKEVIČIŪTĖ-SUBAČIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Zita VALIAUSKIENĖ (apygardoje)', 'Patarėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Greta ZABORSKYTĖ (apygardoje)', 'Patarėja', '(0 5) 209 6696', '[email protected]' FROM mps WHERE name = 'Viktoras Fiodorovas';

-- Viktoras Pranckietis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jūratė TRUNCIENĖ', 'Padėjėja', '(0 5) 209 6630', '[email protected]' FROM mps WHERE name = 'Viktoras Pranckietis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jonas VARKALYS', 'Padėjėjas', '(0 5) 209 6630', '[email protected]' FROM mps WHERE name = 'Viktoras Pranckietis';

-- Viktorija Čmilytė-Nielsen
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laura BALČIŪNAITĖ-TARAŠKIENĖ', 'Patarėja', '(0 5) 209 6690', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintautas Ginas DABAŠINSKAS', 'Patarėjas', '(0 5) 209 6690', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Anelė DROMANTAITĖ', 'Patarėja', '(0 5) 209 6018', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gintarė KUDELYTĖ', 'Patarėja', '(0 5) 209 6690', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raimundas LOPATA', 'Patarėjas', '(0 5) 209 6690', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Andrius PACHAREVAS', 'Patarėjas', '(0 5) 209 6365', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rūta ŠIMONYTĖ', 'Patarėja', '(0 5) 209 6025', '[email protected]' FROM mps WHERE name = 'Viktorija Čmilytė-Nielsen';

-- Violeta Turauskaitė
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Daiva BUDRIENĖ', 'Padėjėja', '(0 5) 209 6648', '' FROM mps WHERE name = 'Violeta Turauskaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta GEDVILAITĖ (apygardoje)', 'Patarėja', '(0 5) 209 6648', '' FROM mps WHERE name = 'Violeta Turauskaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Evaldas RUMBUTIS (apygardoje)', 'Padėjėjas, Patarėjas', '(0 5) 209 6648', '' FROM mps WHERE name = 'Violeta Turauskaitė';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Monika TAMINSKIENĖ', 'Patarėja', '(0 5) 209 6246', '[email protected]' FROM mps WHERE name = 'Violeta Turauskaitė';

-- Virgilijus Alekna
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vilma MARKŪNIENĖ', 'Patarėja', '(0 5) 209 6698', '[email protected]' FROM mps WHERE name = 'Virgilijus Alekna';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Raimonda PONELYTĖ', 'Patarėja', '(0 5) 209 6698', '[email protected]' FROM mps WHERE name = 'Virgilijus Alekna';

-- Vitalijus Gailius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ona ALEKSIŪNAITĖ', 'Patarėja', '(0 5) 209 6913', '[email protected]' FROM mps WHERE name = 'Vitalijus Gailius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aušrinė GRIGALIŪNAITĖ', 'Patarėja', '0 611 20621 (0 5) 209 6913', '[email protected]' FROM mps WHERE name = 'Vitalijus Gailius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inga KARBAUSKIENĖ', 'Patarėja', '0 612 49337 (0 5) 209 6913', '[email protected]' FROM mps WHERE name = 'Vitalijus Gailius';

-- Vitalijus Šeršniovas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Inesa ČEKOLIS-ŠČIOČINA', 'Patarėja', '(0 5) 209 6684', '[email protected]' FROM mps WHERE name = 'Vitalijus Šeršniovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rita KVIKLIENĖ', 'Padėjėja', '(0 5) 209 6684', '[email protected]' FROM mps WHERE name = 'Vitalijus Šeršniovas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Deividas VITKŪNAS', 'Patarėjas', '(0 5) 209 6684', '[email protected]' FROM mps WHERE name = 'Vitalijus Šeršniovas';

-- Vytautas Grubliauskas
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Almantas KAREČKA (apygardoje)', 'Padėjėjas', '(0 5) 209 6627', '[email protected]' FROM mps WHERE name = 'Vytautas Grubliauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kazys KUNEIKA (apygardoje)', 'Padėjėjas', '(0 5) 209 6627', '' FROM mps WHERE name = 'Vytautas Grubliauskas';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julija MAŽEIKAITĖ (apygardoje)', 'Patarėja', '(0 5) 209 6627', '[email protected]' FROM mps WHERE name = 'Vytautas Grubliauskas';

-- Vytautas Jucius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Dalė ANDREIKĖNIENĖ', 'Padėjėja', '(0 5) 209 6661', '[email protected]' FROM mps WHERE name = 'Vytautas Jucius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Eglė PALIONIENĖ', 'Patarėja', '(0 5) 209 6661', '[email protected]' FROM mps WHERE name = 'Vytautas Jucius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita REMEIKIENĖ (apygardoje)', 'Padėjėja', '(0 5) 209 6661', '[email protected]' FROM mps WHERE name = 'Vytautas Jucius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Stasys SKALAUSKAS (apygardoje)', 'Padėjėjas, Patarėjas', '(0 5) 209 6661', '' FROM mps WHERE name = 'Vytautas Jucius';

-- Vytautas Juozapaitis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Rolanda GUDYNIENĖ', 'Padėjėja', '0 652 17226', '[email protected]' FROM mps WHERE name = 'Vytautas Juozapaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Kęstutis KAMINSKAS', 'Patarėjas', '0 612 52633', '[email protected]' FROM mps WHERE name = 'Vytautas Juozapaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaida LAZDAUSKIENĖ', 'Padėjėja', '(0 5) 209 6559', '[email protected]' FROM mps WHERE name = 'Vytautas Juozapaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jurgita NAUJOKAITIENĖ', 'Padėjėja', '0 631 31979', '[email protected]' FROM mps WHERE name = 'Vytautas Juozapaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Izabelė PUKĖNAITĖ', 'Patarėja', '(0 5) 209 6559', '[email protected]' FROM mps WHERE name = 'Vytautas Juozapaitis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Mantas VAIČYS', 'Padėjėjas', '(0 5) 209 6559', '' FROM mps WHERE name = 'Vytautas Juozapaitis';

-- Vytautas Kernagis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laurynas KUBLICKAS', 'Patarėjas', '(0 5) 209 6668', '' FROM mps WHERE name = 'Vytautas Kernagis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Edmundas NEKRAŠEVIČIUS (apygardoje)', 'Padėjėjas', '(0 5) 209 6668', '' FROM mps WHERE name = 'Vytautas Kernagis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Julijonas ŠILEIKA', 'Padėjėjas', '(0 5) 209 6668', '[email protected]' FROM mps WHERE name = 'Vytautas Kernagis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Birutė VIJEIKIENĖ', 'Padėjėja, Patarėja', '(0 5) 209 6668', '[email protected]' FROM mps WHERE name = 'Vytautas Kernagis';

-- Vytautas Sinica
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janina GADLIAUSKIENĖ', 'Patarėja', '(0 5) 209 6608', '[email protected]' FROM mps WHERE name = 'Vytautas Sinica';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Simonas KAUNELIS', 'Patarėjas', '(0 5) 209 6608', '[email protected]' FROM mps WHERE name = 'Vytautas Sinica';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Audrius MAKAUSKAS', 'Patarėjas', '(0 5) 209 6608', '[email protected]' FROM mps WHERE name = 'Vytautas Sinica';

-- Zigmantas Balčytis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vaidutė JAKŠTONIENĖ', 'Patarėja', '(0 5) 209 6736', '[email protected]' FROM mps WHERE name = 'Zigmantas Balčytis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vytautas LAMAUSKAS', 'Patarėjas', '(0 5) 209 6736', '[email protected]' FROM mps WHERE name = 'Zigmantas Balčytis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Arūnas PUPŠYS', 'Patarėjas', '(0 5) 209 6736', '[email protected]' FROM mps WHERE name = 'Zigmantas Balčytis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Liutauras VIČKAČKA', 'Patarėjas', '(0 5) 209 6736', '[email protected]' FROM mps WHERE name = 'Zigmantas Balčytis';

-- Česlav Olševski
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jelena KOŠEVAJA', 'Patarėja', '(0 5) 209 6337', '' FROM mps WHERE name = 'Česlav Olševski';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Vanda KRAVČIONOK (apygardoje)', 'Patarėja', '(0 5) 209 6337', '[email protected]' FROM mps WHERE name = 'Česlav Olševski';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Teresa SOLOVJOVA', 'Patarėja', '(0 5) 209 6337', '' FROM mps WHERE name = 'Česlav Olševski';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Slavomir SUBOTOVIČ (apygardoje)', 'Patarėjas', '(0 5) 209 6337', '' FROM mps WHERE name = 'Česlav Olševski';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Janina TUBELEVIČ (apygardoje)', 'Patarėja', '(0 5) 209 6337', '' FROM mps WHERE name = 'Česlav Olševski';

-- Šarūnas Birutis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Evita Ieva FEDARAVIČIŪTĖ', 'Patarėja', '(0 5) 209 6607', '[email protected]' FROM mps WHERE name = 'Šarūnas Birutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gitana GRIŠKĖNIENĖ', 'Patarėja', '(0 5) 209 6607', '[email protected]' FROM mps WHERE name = 'Šarūnas Birutis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Jolanta JAROŠAITĖ (apygardoje)', 'Patarėja', '(0 5) 209 6607', '[email protected]' FROM mps WHERE name = 'Šarūnas Birutis';

-- Šarūnas Šukevičius
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Aldona JAKAVONIENĖ', 'Patarėja', '(0 5) 209 6009', '[email protected]' FROM mps WHERE name = 'Šarūnas Šukevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Tomas JARUSEVIČIUS', 'Patarėjas', '0 654 33383', '[email protected]' FROM mps WHERE name = 'Šarūnas Šukevičius';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Ilona POCIENĖ', 'Patarėja', '(0 5) 209 6649', '' FROM mps WHERE name = 'Šarūnas Šukevičius';

-- Žygimantas Pavilionis
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Laurynas ČIŽAS', 'Patarėjas', '(0 5) 209 6733', '[email protected]' FROM mps WHERE name = 'Žygimantas Pavilionis';
INSERT INTO mp_assistants (mp_id, name, role, phone, email)
SELECT id, 'Gilija ŠNEIDERYTĖ', 'Patarėja', '(0 5) 209 6733', '[email protected]' FROM mps WHERE name = 'Žygimantas Pavilionis';

END $$;
