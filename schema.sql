-- PostgreSQL Schema Architecture for Employee Scheduling Matrix
CREATE TYPE shift_status_type AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'ABSENT');

CREATE TABLE work_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    station_identifier VARCHAR(100) NOT NULL, -- e.g., 'SOLDER_BENCH_A', 'RETAIL_FLOOR'
    shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
    shift_end TIMESTAMP WITH TIME ZONE NOT NULL,
    required_cert_tag VARCHAR(50),            -- e.g., 'IPC-A-610', 'WISE_L2'
    status shift_status_type DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing temporal fields to guarantee lightning-fast weekly roster lookups
CREATE INDEX idx_shifts_timeline ON work_shifts (shift_start, shift_end);
CREATE INDEX idx_shifts_user ON work_shifts (user_id);
