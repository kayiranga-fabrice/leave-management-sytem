-- Bins table
CREATE TABLE bins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    setup_date DATE NOT NULL,
    worm_population INTEGER,
    current_temperature DECIMAL(4,1),
    current_moisture_level DECIMAL(4,1),
    current_ph_level DECIMAL(3,1),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feeding records table
CREATE TABLE feeding_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bin_id UUID REFERENCES bins(id),
    feed_type VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(5,2) NOT NULL,
    feeding_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Harvests table
CREATE TABLE harvests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bin_id UUID REFERENCES bins(id),
    harvest_date DATE NOT NULL,
    quantity_kg DECIMAL(6,2) NOT NULL,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Environmental data table
CREATE TABLE environmental_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bin_id UUID REFERENCES bins(id),
    temperature DECIMAL(4,1),
    moisture_level DECIMAL(4,1),
    ph_level DECIMAL(3,1),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
