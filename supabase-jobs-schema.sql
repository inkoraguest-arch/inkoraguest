-- SQL Migration: Guest Jobs System

-- 1. Create table for guest job postings
CREATE TABLE IF NOT EXISTS public.guest_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    studio_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    styles_required TEXT[],
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    commission_rate INTEGER DEFAULT 60, -- Percentage for the artist
    is_accommodation BOOLEAN DEFAULT FALSE,
    is_material BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for job applications (artists applying to studio jobs)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.guest_jobs(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES public.profiles(id) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(job_id, artist_id) -- An artist can only apply once per job
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.guest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 4. Policies for guest_jobs
CREATE POLICY "Jobs are viewable by everyone" 
ON public.guest_jobs FOR SELECT USING (true);

CREATE POLICY "Studios can manage their own jobs" 
ON public.guest_jobs FOR ALL USING (auth.uid() = studio_id);

-- 5. Policies for job_applications
CREATE POLICY "Applicants can see their own applications" 
ON public.job_applications FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "Studios can see all applications for their jobs" 
ON public.job_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.guest_jobs 
        WHERE id = job_id AND studio_id = auth.uid()
    )
);

CREATE POLICY "Artists can apply once" 
ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Studios can update application status" 
ON public.job_applications FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.guest_jobs 
        WHERE id = job_id AND studio_id = auth.uid()
    )
);

-- 6. Indexes for performance
CREATE INDEX idx_jobs_studio ON public.guest_jobs(studio_id);
CREATE INDEX idx_applications_job ON public.job_applications(job_id);
CREATE INDEX idx_applications_artist ON public.job_applications(artist_id);
