-- Create activities table for Activity Feed
CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    mp_id INTEGER NOT NULL REFERENCES mps(id),
    bill_id INTEGER REFERENCES bills(id),
    session_vote_id INTEGER REFERENCES session_votes(id),
    metadata JSONB NOT NULL,
    is_highlighted BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT true,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
-- Insert 50 sample activities
INSERT INTO activities (
        type,
        mp_id,
        bill_id,
        metadata,
        is_highlighted,
        is_new,
        category,
        created_at
    )
SELECT (
        ARRAY ['vote', 'comment', 'document', 'session', 'achievement']
    ) [floor(random() * 5 + 1)::int] as type,
    (
        SELECT id
        FROM mps
        ORDER BY RANDOM()
        LIMIT 1
    ) as mp_id,
    CASE
        WHEN random() > 0.5 THEN (
            SELECT id
            FROM bills
            ORDER BY RANDOM()
            LIMIT 1
        )
        ELSE NULL
    END as bill_id,
    CASE
        WHEN type_idx = 1 THEN '{"billTitle": "Dėl Lietuvos Respublikos aplinkos apsaugos įstatymo pakeitimo", "voteChoice": "for"}'::jsonb
        WHEN type_idx = 2 THEN '{"billTitle": "Dėl mokesčių reformos", "commentPreview": "Pritariu šiam įstatymui...", "commentFull": "Pritariu šiam įstatymui, tačiau siūlau papildyti.", "commentLength": 120}'::jsonb
        WHEN type_idx = 3 THEN '{"documentTitle": "Komiteto ataskaita Nr. KA-234", "documentType": "report", "fileSize": "2.4 MB"}'::jsonb
        WHEN type_idx = 4 THEN '{"sessionTitle": "Seimo posėdis Nr. 145", "participationType": "attended", "duration": 180}'::jsonb
        ELSE '{"title": "100 Balsavimų", "description": "Dalyvavo 100 balsavimų per mėnesį", "rarity": "rare"}'::jsonb
    END as metadata,
    (
        CASE
            WHEN i % 10 = 0 THEN true
            ELSE false
        END
    ) as is_highlighted,
    (
        CASE
            WHEN i < 10 THEN true
            ELSE false
        END
    ) as is_new,
    (
        ARRAY ['legislation', 'discussion', 'documents', 'sessions', 'achievements']
    ) [type_idx] as category,
    NOW() - (i * INTERVAL '30 minutes') as created_at
FROM generate_series(1, 50) as i,
    (
        SELECT floor(random() * 5 + 1)::int as type_idx
    ) as t;