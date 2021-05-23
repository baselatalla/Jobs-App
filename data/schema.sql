DROP TABLE IF EXISTS usajobs;

CREATE TABLE IF NOT EXISTS usajobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    company VARCHAR(255),
    location VARCHAR(255),
    url VARCHAR(255),
    description TEXT
);
